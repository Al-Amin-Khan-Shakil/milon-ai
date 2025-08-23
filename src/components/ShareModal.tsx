import React, { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Mail, Copy, Check, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePublicLink: () => void;
  onShareWithEmails: (emails: string[]) => void;
  publicLink: string;
  hasPublicLink: boolean;
}

const EmailInput = memo<{
  email: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}>(({ email, index, onUpdate, onRemove, canRemove }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, e.target.value);
  }, [index, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  return (
    <div className="flex space-x-2">
      <input
        type="email"
        value={email}
        onChange={handleChange}
        placeholder={`Email ${index + 1}`}
        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
      />
      {canRemove && (
        <button
          onClick={handleRemove}
          className="px-2 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

EmailInput.displayName = 'EmailInput';

export const ShareModal: React.FC<ShareModalProps> = memo(({
  isOpen,
  onClose,
  onGeneratePublicLink,
  onShareWithEmails,
  publicLink,
  hasPublicLink
}) => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [copied, setCopied] = useState(false);

  const fullPublicLink = useMemo(() => {
    return `${window.location.origin}/public/${publicLink}`;
  }, [publicLink]);

  const addEmailField = useCallback(() => {
    setEmails(prev => [...prev, '']);
  }, []);

  const updateEmail = useCallback((index: number, value: string) => {
    setEmails(prev => {
      const newEmails = [...prev];
      newEmails[index] = value;
      return newEmails;
    });
  }, []);

  const removeEmail = useCallback((index: number) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleShareWithEmails = useCallback(() => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }
    onShareWithEmails(validEmails);
    setEmails(['']);
    onClose();
  }, [emails, onShareWithEmails, onClose]);

  const copyPublicLink = useCallback(() => {
    navigator.clipboard.writeText(fullPublicLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [fullPublicLink]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Share Chat</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Public Link Section */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center mb-3">
                  <Link className="h-5 w-5 text-blue-400 mr-2" />
                  <h3 className="font-semibold text-white">Public Link</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Anyone with this link can view and participate in the chat
                </p>
                
                {hasPublicLink ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={fullPublicLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={copyPublicLink}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onGeneratePublicLink}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Generate Public Link
                  </button>
                )}
              </div>

              {/* Email Sharing Section */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 text-emerald-400 mr-2" />
                  <h3 className="font-semibold text-white">Share with Specific Users</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Share with specific users by entering their email addresses
                </p>

                <div className="space-y-2 mb-4">
                  {emails.map((email, index) => (
                    <EmailInput
                      key={index}
                      email={email}
                      index={index}
                      onUpdate={updateEmail}
                      onRemove={removeEmail}
                      canRemove={emails.length > 1}
                    />
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addEmailField}
                    className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Email
                  </button>
                  <button
                    onClick={handleShareWithEmails}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-blue-700 transition-all"
                  >
                    Share with Selected Users
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

ShareModal.displayName = 'ShareModal';