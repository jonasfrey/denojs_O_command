
import {
    readableStreamFromReader,
    writableStreamFromWriter,
  } from "https://deno.land/std@0.168.0/streams/conversion.ts";
  import { mergeReadableStreams } from "https://deno.land/std@0.168.0/streams/merge.ts";

// class O_error{
//     constructor(
//         s_msg, 
//         n_return_code, 
//         s_stdout, 
//         s_stderr, 
//         s_json__o_command
//     ){
//         this.s_msg = s_msg
//         this.n_return_code = n_return_code
//         this.s_stdout = s_stdout
//         this.s_stderr = s_stderr
//         this.s_json__o_command = s_json__o_command
//     }
// }
class O_command_log{
    constructor(
        n_ts_ms_start,
        n_ts_ms_end,
        n_ts_ms_delta,
        s_command,
        s_stderr,
        s_stdout
    ){
        this.n_ts_ms_start = n_ts_ms_start,
        this.n_ts_ms_end = n_ts_ms_end,
        this.n_ts_ms_delta = n_ts_ms_delta,
        this.s_command = s_command,
        this.s_stderr = s_stderr,
        this.s_stdout = s_stdout
    }
}
class O_command{
    constructor(
        n_ts_ms_start,
        n_ts_ms_end,
        n_ts_ms_delta,
        s_command, 
        o_process, 
        o_process_child, 
        n_return_code, 
        a_n_byte__stdout,
        a_n_byte__stderr,
        s_stdout,
        s_stderr,
    ){
        this.n_ts_ms_start = n_ts_ms_start
        this.n_ts_ms_end = n_ts_ms_end
        this.n_ts_ms_delta = n_ts_ms_delta
        this.s_command = s_command
        this.o_process = o_process
        this.o_process_child = o_process_child
        this.n_return_code = n_return_code
        this.a_n_byte__stdout = a_n_byte__stdout
        this.a_n_byte__stderr = a_n_byte__stderr
        this.s_stdout = s_stdout
        this.s_stderr = s_stderr
    }
}

let f_read_command_stream = async function(
    s_std = 'stdout', //stdout or stderr
    o_command, 
    f_output_reader_callback
){
    let o_text_decoder = new TextDecoder();
    return new Promise(
        async (f_res)=>{
            let o_reader = o_command.o_process_child[s_std].getReader();
            let n_len_a_n_u8 = 0;
            let a_a_n_u_8 = []

            try {
                while(true){
                    let o_return = await o_reader.read();
                    if(o_return.done){
                        break
                    }
                    let s = o_text_decoder.decode(o_return.value);
                    f_output_reader_callback(s, o_return.value);
                    n_len_a_n_u8 += o_return.value.length;
                    a_a_n_u_8.push(o_return.value);
                    o_command[`s_${s_std}`]+=s;
            
                }
            } finally {

                const a_n_u8_merged = new Uint8Array(n_len_a_n_u8);
                let n_idx = 0;
                for (let a_n_u8 of a_a_n_u_8) {
                    a_n_u8_merged.set(a_n_u8, n_idx);
                    n_idx += a_n_u8.length;
                }
                
                o_command[`a_n_byte__${s_std}`]=a_n_u8_merged
    
                f_res(o_command);

                o_reader.releaseLock();
            }

        }
    )

}
let f_o_command = async function(
    v_command, 
    f_output_reader_callback = null, 
    b_no_bash_mc_prefix = false
){
    var o_command = new O_command(
        new Date().getTime(),
        null,
        null,
        null, 
        null,
        null,
        null, 
        null,
        null,
        '', 
        ''
    )

    let a_s_arg = [];
    if(typeof v_command == 'string'){
        a_s_arg = v_command.split(' ');
    }
    if(Array.isArray(v_command)){
        a_s_arg = v_command
    }
    if(a_s_arg.length == 0){
        throw Error('first parameter to this function must be an array of strings (a_s) or a string (s)')
    }
    a_s_arg = a_s_arg.filter(v=>v.trim()!='');

    if(!b_no_bash_mc_prefix){
        // some commands only will work when using it like this
        // `bash -c my_command "quoted argument"`
        // -c        If  the -c option is present, then commands are read from the first non-option ar‐
        // gument command_string.  If there are arguments after the command_string, the first
        // argument  is  assigned to $0 and any remaining arguments are assigned to the posi‐
        // tional parameters.  The assignment to $0 sets the name of the shell, which is used
        // we cannot just log to the console since cross programming language wise binary calls depend on a clean console to 
        // be able to parse the output as json
        // console.log(`'bash -c ' will be added as a prefix to the command '${s_command}' !`)
        // console.log(`'f_o_command(a_s_arg, true)' <- use this to run a command without the 'bash -c ' prefix'`)
        a_s_arg = ["bash", "-c", a_s_arg.join(' ')]
    }
    o_command.s_command = a_s_arg.join(' ');

    let s_binary = a_s_arg.shift();
    let a_s_argument = a_s_arg

    const o_deno_command = new Deno.Command(
        s_binary,
        {
            args: a_s_argument,
            // stdin: "piped",
            stdout: "piped",
            stderr: 'piped',
            stdin: 'inherit'
        }
    );

    o_command.o_process = o_deno_command
    
    let o_text_decoder = new TextDecoder();
    // let o_text_encoder = new TextEncoder();

    if(typeof f_output_reader_callback != 'function'){
        const { code, stdout, stderr } = await o_deno_command.output();
        o_command.n_return_code = code
        o_command.a_n_byte__stdout = stdout
        o_command.a_n_byte__stderr = stderr
        o_command.s_stderr = o_text_decoder.decode(stderr)
        o_command.s_stdout = o_text_decoder.decode(stdout)
    }

    if(typeof f_output_reader_callback == 'function'){
        o_command.o_process_child = o_deno_command.spawn();
        await Promise.all(
            [
                f_read_command_stream('stdout', o_command, f_output_reader_callback),
                f_read_command_stream('stderr', o_command, f_output_reader_callback)
            ]
        );
        // await o_command.o_process_child.stdin.close()
        o_command.n_return_code = (await o_command.o_process_child.status).code;
    }

    var n_ts_ms_end = new Date().getTime();
    o_command.n_ts_ms_end = n_ts_ms_end
    o_command.n_ts_ms_delta = o_command.n_ts_ms_end-o_command.n_ts_ms_start

    // console.log(o_command)
    // the programmer has to check for errors by him-/her- self
    if(
        o_command.n_return_code != 0 && o_command.s_stderr != "" // a few programms will throw an error but do not have an return code other than 0
        ||
        o_command.n_return_code != 0 // 
    ){
        var o_error = {
            's_msg': 'error happened while running command',
            'o_command.s_command': o_command.s_command,
            'o_command.n_return_code': o_command.n_return_code,
            'o_command.s_stderr': o_command.s_stderr,
            'o_command.s_stdout': o_command.s_stdout,
            'o_command.n_ts_ms_start': o_command.n_ts_ms_start,
            'new Date(o_command.n_ts_ms_start)': new Date(o_command.n_ts_ms_start),
            'o_command.s_stderr': o_command.s_stderr,
        }
        var s_json__o_error = JSON.stringify(o_error, null, 4);
        // console.log(s)
        throw new Error(s_json__o_error);
    }

    return Promise.resolve(o_command);

}
var f_o_command_old = async function(
    a_s_arg, 
    b_no_bash_mc_prefix = false
){
    var s_command = a_s_arg.join(" ")
    if(!b_no_bash_mc_prefix){
        // some commands only will work when using it like this
        // `bash -c my_command "quoted argument"`
        // -c        If  the -c option is present, then commands are read from the first non-option ar‐
        // gument command_string.  If there are arguments after the command_string, the first
        // argument  is  assigned to $0 and any remaining arguments are assigned to the posi‐
        // tional parameters.  The assignment to $0 sets the name of the shell, which is used
        // we cannot just log to the console since cross programming language wise binary calls depend on a clean console to 
        // be able to parse the output as json
        // console.log(`'bash -c ' will be added as a prefix to the command '${s_command}' !`)
        // console.log(`'f_o_command(a_s_arg, true)' <- use this to run a command without the 'bash -c ' prefix'`)
    }

    var n_ts_ms_start = new Date().getTime();

    var a_s_arg = [];
    if(!b_no_bash_mc_prefix){
        a_s_arg = ["bash", "-c", s_command]
    }
    if(b_no_bash_mc_prefix){
        a_s_arg = s_command.split(" ")
    }
    // console.log(`'${a_s_arg.join(' ')}': trying to run command inside folder: '${Deno.cwd()}'`);

    const o_process = await Deno.run(
        {
            cmd:a_s_arg,
            stdout: "piped",
            stderr: "piped",
            stdin: 'inherit'
        }
    );
    var s_command_executed = a_s_arg.join(' ');

    // output needs to be read before .status() or .close()!!!!!
    const a_n_byte__stdout = await o_process.output();
    const a_n_byte__stderr = await o_process.stderrOutput();

    const s_stderr = new TextDecoder().decode(a_n_byte__stderr);
    const s_stdout = new TextDecoder().decode(a_n_byte__stdout);

    
    var n_ts_ms_end = new Date().getTime();
    const { code: n_return_code } = await o_process.status();

    var o_command = new O_command(
        n_ts_ms_start,
        n_ts_ms_end,
        n_ts_ms_end-n_ts_ms_start,
        s_command_executed, 
        o_process,
        n_return_code,
        a_n_byte__stdout, 
        a_n_byte__stderr,
        s_stdout,
        s_stderr
    )
    

    // the programmer has to check for errors by him-/her- self
    if(
        n_return_code != 0 && s_stderr != "" // a few programms will throw an error but do not have an return code other than 0
        ||
        n_return_code != 0 // 
    ){
        var o_error = {
            's_msg': 'error happened while running command',
            'o_command.s_command': o_command.s_command,
            'o_command.n_return_code': o_command.n_return_code,
            'o_command.s_stderr': o_command.s_stderr,
            'o_command.s_stdout': o_command.s_stdout,
            'o_command.n_ts_ms_start': o_command.n_ts_ms_start,
            'new Date(o_command.n_ts_ms_start)': new Date(o_command.n_ts_ms_start),
            'o_command.s_stderr': o_command.s_stderr,
        }
        var s_json__o_error = JSON.stringify(o_error, null, 4);
        // console.log(s)
        throw new Error(s_json__o_error);
    }
    await o_process.close();

    // returns a promise that resolves when the process is killed/closed

    // console.log(o_command)
    return Promise.resolve(o_command)
}


// var f_test = function(){
//     var o_command = f_o_command("touch /xd/1234/asdf/hallo/yess".split(" "));
// }
// f_test();

export {
    O_command, 
    O_command_log, 
    f_o_command,
    f_o_command_old,
}