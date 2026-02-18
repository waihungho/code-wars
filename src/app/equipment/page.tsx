"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { EQUIPMENT_CATALOG, UNEQUIP_FEE_SOL, DIMENSIONS } from "@/lib/constants";
import { createPaymentTransaction, confirmTransaction } from "@/lib/sol-payment";
import {
  addToInventory,
  addBonusPulls,
  addBonusBattles,
  recordTransaction,
  updateTransactionStatus,
  getCardEquipment,
  equipItem,
  unequipItem,
  getPlayerInventory,
} from "@/lib/db";
import type { EquipmentItem, SlotType, Dimension } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type TabMode = "shop" | "mycards";

const SLOT_LABELS: Record<string, string> = {
  stat_boost: "STAT BOOST",
  ability_enhancement: "ABILITY",
  utility: "UTILITY",
  ai_core: "AI CORE",
};

const SLOT_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  stat_boost: { border: "border-cyan-700/40", text: "text-cyan-400", bg: "bg-cyan-950/20" },
  ability_enhancement: { border: "border-amber-700/40", text: "text-amber-400", bg: "bg-amber-950/20" },
  utility: { border: "border-green-700/40", text: "text-green-400", bg: "bg-green-950/20" },
  ai_core: { border: "border-fuchsia-700/40", text: "text-fuchsia-400", bg: "bg-fuchsia-950/20" },
};

const EQUIPPABLE_SLOTS: SlotType[] = ["stat_boost", "ability_enhancement", "utility", "ai_core"];

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "SPD",
  security: "SEC",
  ecosystem: "ECO",
  scalability: "SCL",
  devExp: "DEV",
};

const DIMENSION_COLORS: Record<Dimension, string> = {
  speed: "border-red-600/50 text-red-400 hover:bg-red-950/30",
  security: "border-blue-600/50 text-blue-400 hover:bg-blue-950/30",
  ecosystem: "border-green-600/50 text-green-400 hover:bg-green-950/30",
  scalability: "border-violet-600/50 text-violet-400 hover:bg-violet-950/30",
  devExp: "border-yellow-600/50 text-yellow-400 hover:bg-yellow-950/30",
};

const DIMENSION_ACTIVE_COLORS: Record<Dimension, string> = {
  speed: "border-red-500 bg-red-950/40 text-red-300",
  security: "border-blue-500 bg-blue-950/40 text-blue-300",
  ecosystem: "border-green-500 bg-green-950/40 text-green-300",
  scalability: "border-violet-500 bg-violet-950/40 text-violet-300",
  devExp: "border-yellow-500 bg-yellow-950/40 text-yellow-300",
};

// ---------------------------------------------------------------------------
// Category grouping
// ---------------------------------------------------------------------------

interface CategoryGroup {
  label: string;
  items: EquipmentItem[];
}

function groupByCategory(catalog: EquipmentItem[]): CategoryGroup[] {
  const consumables = catalog.filter((i) => i.slotType === "consumable");
  const statBoost = catalog.filter((i) => i.slotType === "stat_boost");
  const ability = catalog.filter((i) => i.slotType === "ability_enhancement");
  const utility = catalog.filter((i) => i.slotType === "utility");
  const aiCore = catalog.filter((i) => i.slotType === "ai_core");

  return [
    { label: "CONSUMABLES", items: consumables },
    { label: "STAT BOOST", items: statBoost },
    { label: "ABILITY", items: ability },
    { label: "UTILITY", items: utility },
    { label: "AI CORE", items: aiCore },
  ].filter((g) => g.items.length > 0);
}

function getPriceBorderClass(item: EquipmentItem): string {
  if (item.solPrice >= 10) return "border-fuchsia-700/40";
  if (item.solPrice >= 0.5) return "border-amber-700/40";
  if (item.solPrice >= 0.1) return "border-blue-700/40";
  return "border-green-700/40";
}

function getPriceTextClass(item: EquipmentItem): string {
  if (item.solPrice >= 10) return "text-fuchsia-400";
  if (item.solPrice >= 0.5) return "text-amber-400";
  if (item.solPrice >= 0.1) return "text-blue-400";
  return "text-green-400";
}

function isStatChip(item: EquipmentItem): boolean {
  return item.id.startsWith("stat-chip");
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function EquipmentPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { player, cards, inventory, refreshPlayer, refreshCards, refreshInventory } = useGame();

  const [tab, setTab] = useState<TabMode>("shop");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [buyingItemId, setBuyingItemId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [dimSelection, setDimSelection] = useState<Record<string, Dimension>>({});

  // MY CARDS tab state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardEquipment, setCardEquipment] = useState<any[]>([]);
  const [unequippingSlot, setUnequippingSlot] = useState<string | null>(null);
  const [equippingSlot, setEquippingSlot] = useState<string | null>(null);
  const [playerInventory, setPlayerInventory] = useState<any[]>([]);

  const categories = useMemo(() => groupByCategory(EQUIPMENT_CATALOG), []);

  // Fetch SOL balance
  useEffect(() => {
    if (!publicKey || !connection) {
      setSolBalance(null);
      return;
    }
    let cancelled = false;
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        if (!cancelled) setSolBalance(bal / LAMPORTS_PER_SOL);
      } catch {
        if (!cancelled) setSolBalance(null);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  // Fetch card equipment when a card is selected
  useEffect(() => {
    if (!selectedCardId) {
      setCardEquipment([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const eq = await getCardEquipment(selectedCardId);
        if (!cancelled) setCardEquipment(eq ?? []);
      } catch {
        if (!cancelled) setCardEquipment([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedCardId]);

  // Fetch player inventory for MY CARDS tab
  useEffect(() => {
    if (!player || tab !== "mycards") return;
    let cancelled = false;
    const load = async () => {
      try {
        const inv = await getPlayerInventory(player.id);
        if (!cancelled) setPlayerInventory(inv ?? []);
      } catch {
        if (!cancelled) setPlayerInventory([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [player, tab, inventory]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const selectedCard = useMemo(
    () => cards.find((c: any) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  // Find catalog item by id
  const catalogById = useMemo(() => {
    const map: Record<string, EquipmentItem> = {};
    for (const item of EQUIPMENT_CATALOG) {
      map[item.id] = item;
    }
    return map;
  }, []);

  // Inventory items that are NOT equipped to any card (available for equipping)
  const equippedInventoryIds = useMemo(() => {
    return new Set(cardEquipment.map((eq: any) => eq.inventory_id));
  }, [cardEquipment]);

  // All inventory grouped by slot type for the selected card
  const availableBySlot = useMemo(() => {
    const result: Record<string, any[]> = {};
    for (const slot of EQUIPPABLE_SLOTS) {
      result[slot] = playerInventory.filter((inv: any) => {
        const catItem = catalogById[inv.item_id];
        if (!catItem) return false;
        if (catItem.slotType !== slot) return false;
        // Check this inventory item is not already equipped somewhere
        // We need to check globally, not just on this card
        return !equippedInventoryIds.has(inv.id);
      });
    }
    return result;
  }, [playerInventory, catalogById, equippedInventoryIds]);

  // -----------------------------------------------------------------------
  // Buy handler
  // -----------------------------------------------------------------------
  const handleBuy = async (item: EquipmentItem) => {
    if (!player) return;

    // For stat chips, require a dimension selection
    if (isStatChip(item) && !dimSelection[item.id]) {
      showToast("Select a dimension first", "error");
      return;
    }

    setBuyingItemId(item.id);
    try {
      const useRealSol = publicKey && connected;

      if (useRealSol) {
        // Real SOL transaction
        const tx = await createPaymentTransaction(connection, publicKey, item.solPrice);
        const sig = await sendTransaction(tx, connection);
        const txRecord = await recordTransaction({
          player_id: player.id,
          tx_signature: sig,
          sol_amount: item.solPrice,
          item_id: item.id,
          status: "pending",
        });
        const confirmed = await confirmTransaction(connection, sig);
        if (!confirmed) {
          await updateTransactionStatus(txRecord.id, "failed");
          showToast("Transaction failed", "error");
          setBuyingItemId(null);
          return;
        }
        await updateTransactionStatus(txRecord.id, "confirmed");

        // Apply the item
        if (item.slotType === "consumable") {
          await applyConsumable(item);
        } else {
          await addToInventory(player.id, item.id);
        }

        // Refresh balance
        try {
          const bal = await connection.getBalance(publicKey);
          setSolBalance(bal / LAMPORTS_PER_SOL);
        } catch { /* ignore */ }
      } else {
        // Demo mode: skip SOL, directly apply
        if (item.slotType === "consumable") {
          await applyConsumable(item);
        } else {
          await addToInventory(player.id, item.id);
        }
      }

      await refreshPlayer();
      await refreshInventory();
      showToast(`Purchased ${item.name}!`, "success");
    } catch (err: any) {
      console.error("Buy failed:", err);
      showToast(err?.message ?? "Purchase failed", "error");
    } finally {
      setBuyingItemId(null);
    }
  };

  const applyConsumable = async (item: EquipmentItem) => {
    if (!player) return;
    if (item.effectType === "add_pulls") {
      await addBonusPulls(player.id, item.effectValue.amount as number);
    } else if (item.effectType === "add_battles") {
      await addBonusBattles(player.id, item.effectValue.amount as number);
    } else if (item.effectType === "unlimited_battles") {
      // Unlimited battles for 24h: add a large number of battles
      await addBonusBattles(player.id, 9999);
    }
  };

  // -----------------------------------------------------------------------
  // Equip handler
  // -----------------------------------------------------------------------
  const handleEquip = async (inventoryId: string, slotType: SlotType) => {
    if (!selectedCardId) return;
    setEquippingSlot(slotType);
    try {
      await equipItem(selectedCardId, inventoryId, slotType);
      // Refresh equipment
      const eq = await getCardEquipment(selectedCardId);
      setCardEquipment(eq ?? []);
      const inv = await getPlayerInventory(player.id);
      setPlayerInventory(inv ?? []);
      await refreshInventory();
      showToast("Item equipped!", "success");
    } catch (err: any) {
      console.error("Equip failed:", err);
      showToast(err?.message ?? "Equip failed", "error");
    } finally {
      setEquippingSlot(null);
    }
  };

  // -----------------------------------------------------------------------
  // Unequip handler
  // -----------------------------------------------------------------------
  const handleUnequip = async (equipmentId: string) => {
    if (!player) return;
    setUnequippingSlot(equipmentId);
    try {
      const useRealSol = publicKey && connected;

      if (useRealSol) {
        const tx = await createPaymentTransaction(connection, publicKey, UNEQUIP_FEE_SOL);
        const sig = await sendTransaction(tx, connection);
        const txRecord = await recordTransaction({
          player_id: player.id,
          tx_signature: sig,
          sol_amount: UNEQUIP_FEE_SOL,
          item_id: "unequip-fee",
          status: "pending",
        });
        const confirmed = await confirmTransaction(connection, sig);
        if (!confirmed) {
          await updateTransactionStatus(txRecord.id, "failed");
          showToast("Unequip transaction failed", "error");
          setUnequippingSlot(null);
          return;
        }
        await updateTransactionStatus(txRecord.id, "confirmed");

        try {
          const bal = await connection.getBalance(publicKey);
          setSolBalance(bal / LAMPORTS_PER_SOL);
        } catch { /* ignore */ }
      }

      await unequipItem(equipmentId);

      // Refresh
      if (selectedCardId) {
        const eq = await getCardEquipment(selectedCardId);
        setCardEquipment(eq ?? []);
      }
      const inv = await getPlayerInventory(player.id);
      setPlayerInventory(inv ?? []);
      await refreshInventory();
      showToast("Item unequipped!", "success");
    } catch (err: any) {
      console.error("Unequip failed:", err);
      showToast(err?.message ?? "Unequip failed", "error");
    } finally {
      setUnequippingSlot(null);
    }
  };

  // -----------------------------------------------------------------------
  // Render: not connected
  // -----------------------------------------------------------------------
  if (!connected || !player) {
    return (
      <div className="text-center mt-20">
        <p className="text-xs font-mono text-gray-600 tracking-wider">// WALLET NOT CONNECTED</p>
        <p className="text-gray-500 mt-2 text-sm">Connect your wallet to access the equipment shop</p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider border animate-slide-up ${
            toast.type === "success"
              ? "bg-green-950/80 text-green-400 border-green-700/50"
              : "bg-red-950/80 text-red-400 border-red-700/50"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-amber-400/60 tracking-[0.2em] uppercase mb-1">Equipment Armory</p>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-amber-400">EQUIPMENT</span>
            <span className="text-gray-500 font-normal ml-2 text-base">SHOP</span>
          </h1>
        </div>
        <div className="flex gap-1">
          {(["shop", "mycards"] as TabMode[]).map((m) => {
            const label = m === "shop" ? "SHOP" : "MY CARDS";
            const active = tab === m;
            return (
              <button
                key={m}
                onClick={() => setTab(m)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all border ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Balance bar */}
      {tab === "shop" && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 flex items-center justify-between font-mono text-sm animate-slide-up">
          <span className="text-gray-500 text-xs tracking-wider">BALANCE</span>
          <span className="text-amber-400 font-bold">
            {solBalance !== null ? `${solBalance.toFixed(4)} ` : "-- "}
            <span className="text-amber-500/60">SOL</span>
          </span>
        </div>
      )}

      {/* Tab content */}
      {tab === "shop" ? <ShopTab /> : <MyCardsTab />}
    </div>
  );

  // -----------------------------------------------------------------------
  // SHOP TAB
  // -----------------------------------------------------------------------
  function ShopTab() {
    return (
      <div className="space-y-8 animate-fade-in">
        {categories.map((group, gi) => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-mono font-bold tracking-wider text-gray-400 uppercase">
                {group.label}
              </h2>
              <div className="flex-1 h-px bg-gray-800/60" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.items.map((item, ii) => (
                <ShopItemCard key={item.id} item={item} index={gi * 10 + ii} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Shop Item Card
  // -----------------------------------------------------------------------
  function ShopItemCard({ item, index }: { item: EquipmentItem; index: number }) {
    const isBuying = buyingItemId === item.id;
    const borderClass = getPriceBorderClass(item);
    const priceText = getPriceTextClass(item);
    const isAiCore = item.id === "ai-core";
    const needsDimPicker = isStatChip(item);
    const selectedDim = dimSelection[item.id];

    return (
      <div
        className={`
          rounded-xl border overflow-hidden transition-all duration-300 bg-gray-900/50
          ${borderClass}
          ${isAiCore ? "rarity-mythic ring-1 ring-fuchsia-500/20" : ""}
          animate-slide-up
        `}
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div className="p-4 space-y-3">
          {/* Item name + price */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`text-sm font-mono font-bold tracking-wider ${isAiCore ? "text-fuchsia-300" : "text-gray-200"}`}>
                {item.name}
              </h3>
              <p className="text-[10px] font-mono text-gray-500 mt-0.5 leading-relaxed">
                {item.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-mono font-bold ${priceText}`}>
                {item.solPrice < 1 ? item.solPrice : item.solPrice.toFixed(0)}
              </p>
              <p className={`text-[10px] font-mono ${priceText} opacity-60`}>SOL</p>
            </div>
          </div>

          {/* Slot type badge */}
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded border ${
              SLOT_COLORS[item.slotType]
                ? `${SLOT_COLORS[item.slotType].border} ${SLOT_COLORS[item.slotType].text} ${SLOT_COLORS[item.slotType].bg}`
                : "border-gray-700 text-gray-500 bg-gray-900/30"
            }`}>
              {SLOT_LABELS[item.slotType] ?? item.slotType.toUpperCase()}
            </span>
          </div>

          {/* Dimension picker for stat chips */}
          {needsDimPicker && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase">Select Dimension</p>
              <div className="flex gap-1">
                {DIMENSIONS.map((dim) => {
                  const isActive = selectedDim === dim;
                  return (
                    <button
                      key={dim}
                      onClick={() =>
                        setDimSelection((prev) => ({ ...prev, [item.id]: dim }))
                      }
                      className={`flex-1 px-1 py-1 rounded text-[10px] font-mono font-bold tracking-wider border transition-all ${
                        isActive
                          ? DIMENSION_ACTIVE_COLORS[dim]
                          : `border-gray-700/50 text-gray-600 ${DIMENSION_COLORS[dim]}`
                      }`}
                    >
                      {DIMENSION_LABELS[dim]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buy button */}
          <button
            onClick={() => handleBuy(item)}
            disabled={isBuying}
            className={`
              w-full py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all border
              ${isBuying
                ? "bg-gray-800 text-gray-600 border-gray-700 cursor-wait"
                : isAiCore
                  ? "bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/50 hover:bg-fuchsia-500/30 hover:border-fuchsia-400 cursor-pointer"
                  : "bg-amber-600/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30 hover:border-amber-400 cursor-pointer"
              }
            `}
          >
            {isBuying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                PROCESSING...
              </span>
            ) : (
              <>BUY FOR {item.solPrice < 1 ? item.solPrice : item.solPrice.toFixed(0)} SOL</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // MY CARDS TAB
  // -----------------------------------------------------------------------
  function MyCardsTab() {
    if (cards.length === 0) {
      return (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-xs font-mono text-gray-600 tracking-wider">// NO CARDS FOUND</p>
          <p className="text-gray-500 mt-2 text-sm">Summon warriors first to equip them</p>
        </div>
      );
    }

    return (
      <div className="flex gap-6 animate-fade-in">
        {/* Left: card list */}
        <div className="w-48 lg:w-56 shrink-0 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-2 sticky top-0 bg-gray-950 py-1">
            Select a Card [{cards.length}]
          </p>
          {cards.map((card: any) => (
            <div
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className="cursor-pointer"
            >
              <CardDisplay
                language={card.language}
                rarity={card.rarity}
                speed={card.speed}
                security={card.security}
                ecosystem={card.ecosystem}
                scalability={card.scalability}
                dev_exp={card.dev_exp}
                compact
                selected={selectedCardId === card.id}
                onClick={() => setSelectedCardId(card.id)}
              />
            </div>
          ))}
        </div>

        {/* Right: equipment slots */}
        <div className="flex-1 min-w-0">
          {!selectedCard ? (
            <div className="text-center py-16">
              <p className="text-xs font-mono text-gray-600 tracking-wider">// SELECT A CARD</p>
              <p className="text-gray-500 mt-2 text-sm">Choose a warrior to manage equipment</p>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              <div>
                <p className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">
                  Equipped on
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {selectedCard.language}
                  <span className="text-gray-600 font-normal text-sm ml-2">{selectedCard.rarity}</span>
                </p>
              </div>

              {/* 4 equipment slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EQUIPPABLE_SLOTS.map((slot) => (
                  <EquipmentSlotPanel key={slot} slotType={slot} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Equipment Slot Panel
  // -----------------------------------------------------------------------
  function EquipmentSlotPanel({ slotType }: { slotType: SlotType }) {
    const colors = SLOT_COLORS[slotType] ?? { border: "border-gray-700", text: "text-gray-400", bg: "bg-gray-900/20" };
    const label = SLOT_LABELS[slotType] ?? slotType;

    const equippedEntry = cardEquipment.find((eq: any) => eq.slot_type === slotType);
    const equippedInvItem = equippedEntry
      ? playerInventory.find((inv: any) => inv.id === equippedEntry.inventory_id)
      : null;
    const equippedCatalogItem = equippedInvItem ? catalogById[equippedInvItem.item_id] : null;

    const availableItems = availableBySlot[slotType] ?? [];
    const isUnequipping = unequippingSlot === equippedEntry?.id;
    const isEquipping = equippingSlot === slotType;

    return (
      <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 space-y-3 transition-all`}>
        {/* Slot header */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono font-bold tracking-wider ${colors.text}`}>
            SLOT: {label}
          </span>
          {equippedEntry && (
            <span className="text-[9px] font-mono text-gray-600 tracking-wider">EQUIPPED</span>
          )}
        </div>

        {equippedCatalogItem ? (
          /* Equipped item display */
          <div className="space-y-2">
            <div>
              <p className="text-sm font-mono font-bold text-gray-200">{equippedCatalogItem.name}</p>
              <p className="text-[10px] font-mono text-gray-500">{equippedCatalogItem.description}</p>
            </div>
            <button
              onClick={() => handleUnequip(equippedEntry.id)}
              disabled={isUnequipping}
              className="w-full py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border
                bg-red-600/10 text-red-400 border-red-700/40 hover:bg-red-500/20 hover:border-red-500/50 cursor-pointer
                disabled:cursor-wait disabled:opacity-50"
            >
              {isUnequipping ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  UNEQUIPPING...
                </span>
              ) : (
                <>UNEQUIP ({UNEQUIP_FEE_SOL} SOL)</>
              )}
            </button>
          </div>
        ) : (
          /* Empty slot */
          <div className="space-y-2">
            <p className="text-xs font-mono text-gray-600 italic">Empty</p>
            {availableItems.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase">
                  Available ({availableItems.length})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {availableItems.map((inv: any) => {
                    const catItem = catalogById[inv.item_id];
                    if (!catItem) return null;
                    return (
                      <button
                        key={inv.id}
                        onClick={() => handleEquip(inv.id, slotType)}
                        disabled={isEquipping}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all border
                          ${colors.border} hover:bg-white/5 cursor-pointer
                          disabled:cursor-wait disabled:opacity-50`}
                      >
                        <span className="text-gray-300 font-bold">{catItem.name}</span>
                        <span className="text-gray-600 ml-1.5">{catItem.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[10px] font-mono text-gray-700">No items available for this slot</p>
            )}
          </div>
        )}
      </div>
    );
  }
}
