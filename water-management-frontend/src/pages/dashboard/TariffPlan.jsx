import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Info } from 'lucide-react';
import { tariffPlanApi } from '../../api';

const TariffPlan = () => {
  const communityId = localStorage.getItem('communityId');
  const [planId, setPlanId] = useState(null);
  const [tiers, setTiers] = useState([{ id: Date.now(), to: '', rate: '' }]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (communityId) {
      loadTariffPlan();
    }
  }, [communityId]);

  const loadTariffPlan = async () => {
    try {
      const data = await tariffPlanApi.getByCommunity(communityId);
      if (data && data.waterTiers && data.waterTiers.length > 0) {
        setPlanId(data.id);
        const loadedTiers = data.waterTiers.map((tier, index) => ({
          id: Date.now() + index,
          to: tier.maxVolumeKL === null ? '' : tier.maxVolumeKL,
          rate: tier.ratePerKL
        }));
        setTiers(loadedTiers);
      }
    } catch (error) {
      console.log('No existing tariff plan found, or error loading.', error);
    }
  };

  const addTier = () => {
    setTiers([...tiers, { id: Date.now(), to: '', rate: '' }]);
  };

  const removeTier = (idToRemove) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter(t => t.id !== idToRemove));
    }
  };

  const handleTierChange = (id, field, value) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const calculateFrom = (index) => {
    if (index === 0) return 0;
    const prevTo = tiers[index - 1].to;
    return prevTo === '' ? '∞' : prevTo;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validate
      const waterTiers = tiers.map((t, index) => {
        const isLast = index === tiers.length - 1;
        const maxVolumeKL = t.to === '' || t.to === null ? null : parseFloat(t.to);
        return {
          maxVolumeKL,
          ratePerKL: parseFloat(t.rate)
        };
      });

      const payload = {
        communityId,
        name: "Community Tiered Plan",
        waterTiers,
        baselineMinimumCharge: 0
      };

      if (planId) {
        await tariffPlanApi.update(planId, payload);
      } else {
        const res = await tariffPlanApi.create(payload);
        setPlanId(res.id);
      }
      alert('Tariff plan saved successfully!');
    } catch (error) {
      alert('Failed to save tariff plan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-slate-900">Tariff Engine Configuration</h2>
      <p className="text-sm text-slate-500 mb-8">Set the tiered billing rates for water consumption.</p>

      <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-start">
        <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-600">
          Tiers must be contiguous, starting at 0, with no gaps or overlaps. Leave the "UP TO (KL)" empty for the final tier to mean infinity (∞).
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">From (KL)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Up To (KL)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase">Rate (₹ / KL)</th>
              <th className="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tiers.map((tier, index) => (
              <tr key={tier.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-slate-400 mr-2">{index === 0 ? 'Starts at' : '>'}</span>
                    <span className="font-bold text-slate-700">{calculateFrom(index)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    placeholder="∞"
                    value={tier.to}
                    onChange={(e) => handleTierChange(tier.id, 'to', e.target.value)}
                    className="w-full p-2.5 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-purple-500 bg-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={tier.rate}
                      onChange={(e) => handleTierChange(tier.id, 'rate', e.target.value)}
                      className="w-full pl-7 p-2.5 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-purple-500 bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      tiers.length === 1 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
          <button
            onClick={addTier}
            className="flex items-center text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Tier
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-sm disabled:opacity-70"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Tariff Plan'}
        </button>
      </div>
    </div>
  );
};

export default TariffPlan;
