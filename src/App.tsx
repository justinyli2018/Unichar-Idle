import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from './hooks/useGame';
import { TopBar } from './components/TopBar';
import { BottomNav, Tab } from './components/BottomNav';
import { IdleTab } from './components/tabs/IdleTab';
import { GachaTab } from './components/tabs/GachaTab';
import { CollectionTab } from './components/tabs/CollectionTab';
import { UpgradeTab } from './components/tabs/UpgradeTab';
import { BattleTab } from './components/tabs/BattleTab';
import { CollectionSettings, UpgradeSettings } from './types';
import { NotificationOverlay } from './components/NotificationOverlay';

export default function App() {
  const { 
    state, 
    productionRate, 
    summon, 
    assignSlot, 
    clearSlot, 
    updateUnichar, 
    sellUnichar, 
    resetData,
    setBanner,
    updateTabSettings,
    clearNotification,
    fillSynergyGroup,
    triggerDiscoveryNotifications,
    productionBreakdown,
    upgrade
  } = useGame();
  const [currentTab, setCurrentTab] = useState<Tab>('gacha');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDesktop) return;
      
      // Don't switch tabs if user is typing in a text box
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      
      // CRITICAL: If GachaTab handled the arrow keys for banner switching, it calls preventDefault()
      if (isTyping || e.defaultPrevented) return;

      const tabs: Tab[] = ['idle', 'gacha', 'collection', 'upgrade', 'battle'];
      const currentIndex = tabs.indexOf(currentTab);
      
      if (e.key.toLowerCase() === 'a' || (e.key === 'ArrowLeft' && currentTab !== 'gacha')) {
        const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setCurrentTab(tabs[nextIndex]);
      } else if (e.key.toLowerCase() === 'd' || (e.key === 'ArrowRight' && currentTab !== 'gacha')) {
        const nextIndex = (currentIndex + 1) % tabs.length;
        setCurrentTab(tabs[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTab, isDesktop]);

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-zinc-800">
      <TopBar 
        bits={state.bits} 
        productionRate={productionRate} 
        productionBreakdown={productionBreakdown}
        onReset={resetData} 
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {currentTab === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <IdleTab
                slots={state.idleSlots}
                inventory={state.inventory}
                discoveredGroupIds={state.discoveredGroupIds}
                availableGroupIds={state.availableGroupIds}
                onAssign={assignSlot}
                onClear={clearSlot}
                onUpdateUnichar={updateUnichar}
                onFillGroup={fillSynergyGroup}
              />
            </motion.div>
          )}
          {currentTab === 'gacha' && (
            <motion.div
              key="gacha"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <GachaTab
                bits={state.bits}
                freePulls={state.freePulls}
                onSummon={summon}
                inventory={state.inventory}
                isDesktop={isDesktop}
                onUpdateUnichar={updateUnichar}
                currentBannerId={state.currentBannerId}
                onSetBanner={setBanner}
                onTriggerDiscoveryNotifications={triggerDiscoveryNotifications}
              />
            </motion.div>
          )}
          {currentTab === 'collection' && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CollectionTab
                inventory={state.inventory}
                onUpdateUnichar={updateUnichar}
                onSell={sellUnichar}
                settings={state.tabSettings.collection}
                onUpdateSettings={(settings) => updateTabSettings('collection', settings)}
              />
            </motion.div>
          )}
          {currentTab === 'upgrade' && (
            <motion.div
              key="upgrade"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <UpgradeTab
                inventory={state.inventory}
                onUpgrade={upgrade}
                idleSlots={state.idleSlots}
                tabSettings={state.tabSettings.upgrade}
                onUpdateSettings={(settings) => updateTabSettings('upgrade', settings)}
              />
            </motion.div>
          )}
          {currentTab === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <BattleTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav currentTab={currentTab} setTab={setCurrentTab} isDesktop={isDesktop} />
      
      <NotificationOverlay 
        notifications={state.notifications} 
        onClear={clearNotification} 
      />
    </div>
  );
}
