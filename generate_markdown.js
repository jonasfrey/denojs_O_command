import {
    f_generate_markdown 
} from 'https://deno.land/x/f_generate_markdown@0.7/mod.js'
let s_path_file = Deno.args[0];
f_generate_markdown(s_path_file)