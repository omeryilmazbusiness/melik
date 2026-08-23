'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { adminGetCampaigns, adminCreateCampaign, adminUpdateCampaign, adminDeleteCampaign } from '@/lib/admin-api';
import type { Campaign } from '@/lib/types';

export default function CampaignsAdminPage() {
  const [campaigns, setCampaigns] = useState<(Campaign & { sort_order?: number })[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎉');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  const load = () => adminGetCampaigns().then((res) => setCampaigns(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await adminCreateCampaign({ name, icon, sort_order: campaigns.length + 1 });
    setName('');
    setIcon('🎉');
    load();
  };

  const startEdit = (c: Campaign) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon);
  };

  const saveEdit = async () => {
    if (!editId) return;
    await adminUpdateCampaign(editId, { name: editName, icon: editIcon });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) return;
    await adminDeleteCampaign(id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Kampanyalar</h1>
      <p className="text-sm text-gray-500 mb-6">Header altındaki kampanya linklerini yönetin</p>

      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Kampanya Adı</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Büyük İndirim" required />
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
        {campaigns.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            {editId === c.id ? (
              <>
                <input value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-12 h-9 text-center rounded-lg border border-gray-200 text-sm" />
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm" />
                <button type="button" onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                <button type="button" onClick={() => setEditId(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><X size={16} /></button>
              </>
            ) : (
              <>
                <span className="text-xl w-8 text-center">{c.icon}</span>
                <span className="flex-1 font-medium text-gray-800">{c.name}</span>
                {c.is_highlighted && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Vurgulu</span>}
                <span className="text-xs text-gray-400 hidden sm:block">{c.slug}</span>
                <button type="button" onClick={() => startEdit(c)} className="p-2 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50"><Pencil size={16} /></button>
                <button type="button" onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
