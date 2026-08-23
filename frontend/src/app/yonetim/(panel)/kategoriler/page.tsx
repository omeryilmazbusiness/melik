'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/admin-api';
import type { Category } from '@/lib/types';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const load = () => adminGetCategories().then((res) => setCategories(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await adminCreateCategory({ name, icon, sort_order: categories.length + 1 });
    setName('');
    setIcon('🏷️');
    load();
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  };

  const saveEdit = async () => {
    if (!editId) return;
    await adminUpdateCategory(editId, { name: editName, icon: editIcon });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await adminDeleteCategory(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Silinemedi');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategoriler</h1>
      <p className="text-sm text-gray-500 mb-6">Bebek, Kız Çocuk, Erkek Çocuk ve yeni türler ekleyin</p>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Kategori Adı</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Bebek" required />
        </div>
        <div className="w-20">
          <label className="text-xs font-medium text-gray-500 mb-1 block">İkon</label>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full h-10 px-2 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
        </div>
        <button type="submit" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors">
          <Plus size={16} /> Ekle
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
            {editId === cat.id ? (
              <>
                <input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-12 h-9 text-center rounded-lg border border-gray-200 text-sm" />
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm" />
                <button type="button" onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                <button type="button" onClick={() => setEditId(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><X size={16} /></button>
              </>
            ) : (
              <>
                <span className="text-xl w-8 text-center">{cat.icon}</span>
                <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400 hidden sm:block">{cat.slug}</span>
                <button type="button" onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50"><Pencil size={16} /></button>
                <button type="button" onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
