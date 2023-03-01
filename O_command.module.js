
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
        this.n_return_code = n_return_code
        this.a_n_byte__stdout = a_n_byte__stdout
        this.a_n_byte__stderr = a_n_byte__stderr
        this.s_stdout = s_stdout
        this.s_stderr = s_stderr
    }
}

var f_o_command = async function(
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
    console.log(`'${a_s_arg.join(' ')}': trying to run command inside folder: '${Deno.cwd()}'`);

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
    f_o_command
}