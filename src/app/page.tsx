'use client';

import { useState, useEffect } from 'react';

type Tag = {
  id: string;
  tag: string;
};

type Memo = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  tags: Tag[];
};


export default function Home() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMemo, setNewMemo] = useState({ title: '', content: '', tags: [] as string[] });
  const [memos, setMemos] = useState<Memo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(()=> {
    const fetchData = async () =>{
      //メモ一覧
      const memoResponse = await fetch(`/api/memos`);
      const memoData = await memoResponse.json();
      setMemos(memoData.data || []);

      //タグ一覧
      const tagResponse = await fetch(`/api/tags`);
      const tagData = await tagResponse.json();
      setTags(tagData.data || []);
    }
    fetchData();
  }, []);

  // タグでフィルタリング
  const filteredMemos = selectedTag
    ? memos.filter((memo) => memo.tags.some(t => t.id === selectedTag)):memos;

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* タグサイドバー */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">タグ</h2>
          <button
            onClick={() => setIsCreatingTag(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
        
        {isCreatingTag && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
              placeholder="タグ名"
              autoFocus
            />
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">色を選択</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newTagName.trim()) {
                    const newTag: Tag = {
                      id: Date.now().toString(),
                      name: newTagName.trim(),
                      color: newTagColor,
                    };
                    setTags([...tags, newTag]);
                    setNewTagName('');
                    setNewTagColor('#8B5CF6');
                    setIsCreatingTag(false);
                  }
                }}
                className="flex-1 text-sm bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
              >
                作成
              </button>
              <button
                onClick={() => {
                  setIsCreatingTag(false);
                  setNewTagName('');
                  setNewTagColor('#8B5CF6');
                }}
                className="flex-1 text-sm bg-gray-200 text-gray-700 py-1 px-2 rounded hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setSelectedTag(null)}
          className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
            selectedTag === null
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
        >
          すべてのメモ
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.id)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors flex items-center ${
              selectedTag === tag.id
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        ))}
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">メモ一覧</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemos.map((memo) => (
            <div
              key={memo.id}
              onClick={() => setSelectedMemo(memo)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {memo.title}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(memo.createdAt)}
              </p>
              <div className="flex gap-2 mt-3">
                {memo.tags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* メモ詳細モーダル */}
      {selectedMemo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMemo(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedMemo.title}</h2>
              <button
                onClick={() => setSelectedMemo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {formatDate(selectedMemo.createdAt)}
            </p>
            <div className="flex gap-2 mb-4">
              {selectedMemo.tags.map((tagId) => {
                const tag = mockTags.find((t) => t.id === tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="px-3 py-1 text-sm rounded-full text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
            <div className="whitespace-pre-wrap">{selectedMemo.content}</div>
          </div>
        </div>
      )}

      {/* FABボタン */}
      <button
        onClick={() => setIsCreateDialogOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* 新規作成ダイアログ */}
      {isCreateDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4 z-50"
          onClick={() => setIsCreateDialogOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">新規メモ作成</h2>
              <button
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewMemo({ title: '', content: '', tags: [] });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={newMemo.title}
                  onChange={(e) => setNewMemo({ ...newMemo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="メモのタイトルを入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  value={newMemo.content}
                  onChange={(e) => setNewMemo({ ...newMemo, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="メモの内容を入力"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タグ
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setNewMemo({
                          ...newMemo,
                          tags: newMemo.tags.includes(tag.id)
                            ? newMemo.tags.filter((t) => t !== tag.id)
                            : [...newMemo.tags, tag.id],
                        });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        newMemo.tags.includes(tag.id)
                          ? 'text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: newMemo.tags.includes(tag.id)
                          ? tag.color
                          : undefined,
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    console.log('新規メモ作成:', newMemo);
                    setIsCreateDialogOpen(false);
                    setNewMemo({ title: '', content: '', tags: [] });
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewMemo({ title: '', content: '', tags: [] });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}