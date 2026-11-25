import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  Search,
  Send,
  X,
} from 'lucide-react';
import { ChatBubble } from '../components/marketplace/ChatBubble';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { EmptyState, LoadingState } from '../components/ui/States';
import { useApp } from '../context/AppContext';
import { Conversation } from '../types/marketplace';
import { formatPrice, formatRelativeDate, getInitials } from '../utils/formatters';

export const MessagesPage: React.FC = () => {
  const {
    currentUser,
    conversations,
    messages,
    activeConversationId,
    selectConversation,
    sendMessage,
    updateConversationStatus,
    navigate,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [draftText, setDraftText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(activeConversationId));
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return [...conversations]
      .filter((c) => {
        if (!q) return true;
        return (
          c.otherUserName.toLowerCase().includes(q) ||
          c.productTitle.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || filteredConversations[0],
    [conversations, activeConversationId, filteredConversations]
  );

  const threadMessages = useMemo(() => {
    if (!activeConversation) return [];
    return messages
      .filter((m) => m.conversationId === activeConversation.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, activeConversation?.id]);

  const handleOpenConversation = (id: string) => {
    setIsLoadingThread(true);
    selectConversation(id);
    setMobileShowThread(true);
    setTimeout(() => setIsLoadingThread(false), 180);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachmentUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;
    if (!draftText.trim() && !attachmentUrl) return;
    sendMessage(activeConversation.id, draftText, attachmentUrl);
    setDraftText('');
    setAttachmentUrl(undefined);
  };

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="w-6 h-6 text-slate-400" />}
        title="No messages yet"
        description="Start a conversation by clicking 'Chat with Seller' on any product in the campus marketplace."
        actionLabel="Browse Marketplace"
        onAction={() => navigate('browse')}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-11rem)] min-h-[540px]">
      {/* Left Conversation List */}
      <div
        className={`md:col-span-4 border-r border-slate-200 flex flex-col h-full ${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200 space-y-3">
          <h1 className="font-display text-lg font-bold text-slate-900">Messages</h1>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 text-center">No matching conversations.</p>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleOpenConversation(conv.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center">
                      {getInitials(conv.otherUserName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display text-sm font-semibold text-slate-900 truncate">
                        {conv.otherUserName}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                        {formatRelativeDate(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-teal-700 truncate mt-0.5">
                      {conv.productTitle}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="text-[11px] font-mono-tabular font-semibold bg-teal-700 text-white rounded-full px-1.5 py-0.5 leading-none">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Active Thread */}
      <div
        className={`md:col-span-8 flex flex-col h-full bg-slate-50/60 ${
          mobileShowThread ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  aria-label="Back to conversation list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {getInitials(activeConversation.otherUserName)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-semibold text-slate-900 truncate">
                    {activeConversation.otherUserName}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">
                    {activeConversation.otherUserOnline ? 'Online now' : 'Offline'} ·{' '}
                    {activeConversation.otherUserUniversity}
                  </p>
                </div>
              </div>

              <div className="w-44 shrink-0">
                <Select
                  aria-label="Conversation status"
                  value={activeConversation.status}
                  onChange={(e) =>
                    updateConversationStatus(
                      activeConversation.id,
                      e.target.value as Conversation['status']
                    )
                  }
                  options={[
                    { value: 'Active Inquiry', label: 'Active Inquiry' },
                    { value: 'Meetup Scheduled', label: 'Meetup Scheduled' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                  className="!py-1.5 !text-xs"
                />
              </div>
            </div>

            {/* Product Reference Card */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate('product-details', { productId: activeConversation.productId })
                }
                className="flex items-center gap-3 min-w-0 text-left hover:opacity-85 cursor-pointer"
              >
                <img
                  src={activeConversation.productImage}
                  alt={activeConversation.productTitle}
                  referrerPolicy="no-referrer"
                  className="w-11 h-9 rounded-md object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {activeConversation.productTitle}
                  </p>
                  <p className="font-mono-tabular text-xs font-semibold text-teal-700">
                    {formatPrice(activeConversation.productPrice)}
                  </p>
                </div>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate('product-details', { productId: activeConversation.productId })
                }
              >
                View Item
              </Button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingThread ? (
                <LoadingState count={3} variant="list" />
              ) : (
                threadMessages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUser?.id}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="bg-white border-t border-slate-200 p-3 space-y-2.5"
            >
              {attachmentUrl && (
                <div className="relative inline-block">
                  <img
                    src={attachmentUrl}
                    alt="Attachment preview"
                    className="h-20 rounded-lg border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachmentUrl(undefined)}
                    aria-label="Remove attachment"
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label
                  className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                  aria-label="Attach image"
                >
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    className="sr-only"
                  />
                </label>
                <input
                  type="text"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Write a message or suggest a campus meetup spot..."
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700"
                />
                <Button type="submit" disabled={!draftText.trim() && !attachmentUrl}>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <EmptyState
              title="Select a conversation"
              description="Choose a student chat from the left to view messages and coordinate a meetup."
            />
          </div>
        )}
      </div>
    </div>
  );
};
