import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnuyiwtlivjmxhlezdyd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_M3RhN88pFSB1pof4LMC-fw_66N7XgTr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
