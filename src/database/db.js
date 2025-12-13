// src/database/db.js
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger.js";

// load environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

supabaseUrl
  ? logger.green("SUCCESS", `URL Supabase: ${supabaseUrl}`)
  : logger.red("ERROR", "URL Supabase Not Found");

supabaseAnonKey
  ? logger.green("SUCCESS", `Anon Key: ${supabaseAnonKey}`)
  : logger.red("ERROR", "Anon Key Not Found");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

logger.green("SUCCESS", "Supabase client initialized!");
