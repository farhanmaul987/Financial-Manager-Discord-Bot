// src/database/db.js
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// load environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log(
  "URL Supabase yang digunakan:",
  supabaseUrl ? supabaseUrl : "TIDAK DITEMUKAN"
);
console.log(
  "Anon Key Supabase yang digunakan:",
  supabaseAnonKey ? supabaseAnonKey : "TIDAK DITEMUKAN"
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Supabase URL atau Anon Key tidak ditemukan di .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client berhasil diinisialisasi.");
