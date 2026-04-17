import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://aiiatkwepxotlgubrikw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpaWF0a3dlcHhvdGxndWJyaWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTM1ODIsImV4cCI6MjA5MDg4OTU4Mn0.dSak_WfJ8LROIrNn0Ch8Znzi_W9uhAr-epe6B35WFMQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
