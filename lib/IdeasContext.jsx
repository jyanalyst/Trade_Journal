'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, ideaToRow, rowToIdea } from './supabase';
import { newIdea } from './helpers';

const IdeasContext = createContext(null);

export function IdeasProvider({ children }) {
  const [ideas, setIdeas] = useState([]);
  const [editing, setEditing] = useState(null);

  // Load from Supabase on mount (offline-safe)
  useEffect(() => {
    let cancelled = false;
    async function loadIdeas() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("ideas").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled) setIdeas(data.map(rowToIdea));
      } catch (e) {
        console.warn("[Supabase] load failed, using in-memory state:", e.message);
      }
    }
    loadIdeas();
    return () => { cancelled = true; };
  }, []);

  // Persistence helpers (offline-safe — UI updates first, DB follows)
  async function persistUpsert(idea) {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("ideas").upsert(ideaToRow(idea));
      if (error) throw error;
    } catch (e) {
      console.warn("[Supabase] save failed, using in-memory state:", e.message);
    }
  }

  const addIdea = kz => {
    const idea = newIdea(kz);
    setIdeas(p => [...p, idea]);
    setEditing(idea);
    persistUpsert(idea);
  };
  const saveIdea = u => {
    setIdeas(p => p.map(i => i.id === u.id ? u : i));
    setEditing(null);
    persistUpsert(u);
  };
  const executeIdea = u => {
    setIdeas(p => p.map(i => i.id === u.id ? u : i));
    persistUpsert(u);
  };
  const deleteIdea = id => {
    setIdeas(p => p.filter(i => i.id !== id));
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase.from("ideas").delete().eq("id", String(id));
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] delete failed, using in-memory state:", e.message);
      }
    })();
  };
  const cancelIdea = id => {
    const updatedAt = new Date().toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"});
    setIdeas(p => p.map(i => i.id === id ? { ...i, status:"cancelled", updatedAt } : i));
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from("ideas").update({ status:"cancelled", updated_at: updatedAt }).eq("id", String(id));
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] cancel failed, using in-memory state:", e.message);
      }
    })();
  };
  const clearAll = () => {
    setIdeas([]);
    (async () => {
      if (!supabase) return;
      try {
        const { error } = await supabase.from("ideas").delete().neq("id", "");
        if (error) throw error;
      } catch (e) {
        console.warn("[Supabase] clear failed, using in-memory state:", e.message);
      }
    })();
  };

  // Derived data
  const boardIdeas    = ideas.filter(i => i.status !== "executed");
  const executedIdeas  = ideas.filter(i => i.status === "executed");
  const runningIdeas   = ideas.filter(i => i.status === "executed" && !i.exitPrice);
  const completedIdeas = ideas.filter(i => i.status === "executed" && !!i.exitPrice);
  const watchingIdeas  = ideas.filter(i => i.status === "watching");
  const readyIdeas     = ideas.filter(i => i.status === "ready");

  return (
    <IdeasContext.Provider value={{
      ideas, editing, setEditing,
      addIdea, saveIdea, executeIdea, deleteIdea, cancelIdea, clearAll,
      boardIdeas, executedIdeas, runningIdeas, completedIdeas, watchingIdeas, readyIdeas,
    }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider");
  return ctx;
}
