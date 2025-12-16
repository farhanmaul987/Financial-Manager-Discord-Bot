import { supabase } from "../../database/db.js";

export const cache = {
  wallet: { data: null, last: 0 },
  category: { data: null, last: 0 },
};

const CACHE_TTL = 5000;

export async function getCachedRPC(key, rpcName, userId, ttl = CACHE_TTL) {
  const now = Date.now();
  const shouldRefresh =
    !cache[key].data ||
    cache[key].data.length === 0 ||
    now - cache[key].last >= ttl;

  if (!shouldRefresh) {
    return cache[key].data;
  }

  const { data, error } = await supabase.rpc(rpcName, { p_id_user: userId });

  if (error) {
    console.error(`Error on RPC ${rpcName}:`, error);
    return cache[key].data ?? [];
  }

  cache[key].data = data || [];
  cache[key].last = now;
  return cache[key].data;
}
