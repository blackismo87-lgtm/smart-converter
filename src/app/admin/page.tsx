'use client';

import { BarChart2, HardDrive, Users, DollarSign, Activity, FileText, UserPlus, Clock, Image as LucideImage, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch System Stats
        const { data: statsData } = await insforge.database
          .from('system_stats')
          .select('*')
          .maybeSingle();
        
        // Fetch Ad Placements
        const { data: adsData } = await insforge.database
          .from('ad_placements')
          .select('*')
          .order('impressions', { ascending: false });

        // Fetch Recent Activities
        const { data: activitiesData } = await insforge.database
          .from('processed_files')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (statsData) setStats(statsData);
        if (adsData) setAds(adsData);
        if (activitiesData) setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Console d'Administration</h1>
          <p className="text-slate-400">Aperçu du système et indicateurs de performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-white">Alex Morgan</p>
            <p className="text-xs text-slate-500">Super Administrateur</p>
          </div>
          <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center text-brand">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total des Fichiers Traités" 
          value={stats?.total_files_processed?.toLocaleString() || '0'} 
          icon={<FileText className="w-5 h-5" />} 
        />
        <StatCard 
          title="Stockage Économisé" 
          value={`${((stats?.total_storage_saved || 0) / 1e12).toFixed(2)} To`} 
          icon={<HardDrive className="w-5 h-5" />} 
        />
        <StatCard 
          title="Utilisateurs Actifs" 
          value={stats?.active_users?.toLocaleString() || '0'} 
          icon={<Users className="w-5 h-5" />} 
        />
        <StatCard 
          title="Revenus Publicitaires" 
          value={`$${(ads.reduce((acc, ad) => acc + (ad.impressions * ad.cpc), 0) / 100).toFixed(2)}`} 
          icon={<DollarSign className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts/Analytics Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Analyse de l'Utilisation des Fichiers</h3>
              <div className="text-xs text-slate-500">Vue Hebdomadaire</div>
            </div>
            <div className="flex-grow flex items-end justify-between gap-2">
              {[60, 80, 45, 90, 70, 50, 65].map((h, i) => (
                <div key={i} className="flex-grow bg-brand/20 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-brand rounded-t-lg transition-all" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500 uppercase tracking-widest">
              <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
            </div>
          </div>

          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Activité Récente</h3>
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity) => (
                <ActivityItem 
                  key={activity.id}
                  title={activity.file_name} 
                  subtitle={`${activity.file_type === 'image' ? 'Compressé' : 'Traité'} à ${((activity.compressed_size || 0) / 1024 / 1024).toFixed(1)}Mo`} 
                  time={new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  icon={activity.file_type === 'image' ? <LucideImage className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                />
              )) : (
                <div className="text-center py-8 text-slate-500 text-sm">Aucune activité récente</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          <div className="bg-darkcard border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Gestion AdSense</h3>
            <p className="text-sm text-slate-400 mb-6">Optimiser la performance des placements publicitaires</p>
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="flex justify-between text-sm group cursor-pointer hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors">
                  <span className="text-slate-300">{ad.name}</span>
                  <div className="text-right">
                    <span className="block font-bold text-white">{ad.impressions.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500">${ad.cpc} CPC</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
              Gérer les Publicités
            </button>
          </div>

          <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6">
            <h4 className="font-bold text-brand mb-2">État du Système</h4>
            <div className="flex items-center gap-2 text-sm text-brand-hover">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Tous les systèmes sont opérationnels
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-darkcard border border-slate-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-lg text-brand">
          {icon}
        </div>
        <div className="text-xs text-green-500 font-bold">+4.3%</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-widest">{title}</div>
    </div>
  );
}

function ActivityItem({ title, subtitle, time, icon }: { title: string, subtitle: string, time: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-grow">
        <div className="text-sm font-bold text-white truncate max-w-[200px]">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="text-[10px] text-slate-500 flex items-center gap-1 whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {time}
      </div>
    </div>
  );
}
