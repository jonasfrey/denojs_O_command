
import {
    readableStreamFromReader,
    writableStreamFromWriter,
  } from "https://deno.land/std@0.168.0/streams/conversion.ts";
  import { mergeReadableStreams } from "https://deno.land/std@0.168.0/streams/merge.ts";

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
    a_s_arg
){
    var s_command = a_s_arg.join(" ")
    var a_s_biggerthan_symbol = a_s_arg.filter(s=>s.trim() == '>');
    var a_s_smallerthan_symbol = a_s_arg.filter(s=>s.trim() == '<');

    if(a_s_biggerthan_symbol.length > 1){
        console.log(`'${s_command}': command won't be run, multiple '<' symbols are not supported`);
        return null;
    }
    if(a_s_smallerthan_symbol.length > 1){
        console.log(`'${s_command}': command won't be run, multiple '<' symbols are not supported`);
        return null;
    }

    if(a_s_biggerthan_symbol.length == 1 && a_s_smallerthan_symbol.length > 1){
        console.log(`'${s_command}': command won't be run, using '<' and  '>' at the same time is not yet supported`);
        return null;
    }

    // ... there may be more redirection symbols ? 
    var a_s_custom_redirection_symbols_not_supported_yet = [
        `<<`, 
        '&>', 
        '<&', 
        '&>>', 
        '2>&1', 
        '>&1', 
        '|', 
        '>>'
    ];
    for(var s_arg of a_s_arg){
        // https://askubuntu.com/questions/420981/how-do-i-save-terminal-output-to-a-file
        // Yes it is possible, just redirect the output (AKA stdout) to a file:
        // `SomeCommand > SomeFile.txt`  

        // Or if you want to append data:
        // `SomeCommand >> SomeFile.txt`

        // If you want stderr as well use this:
        // `SomeCommand &> SomeFile.txt`

        // or this to append:
        // `SomeCommand &>> SomeFile.txt`

        // if you want to have both stderr and output displayed on the console and in a file use this:
        // (If you want the output only, drop the 2)
        // `SomeCommand 2>&1 | tee SomeFile.txt`
        // console.log(`${a_s_custom_redirection_symbols_not_supported_yet} ?= ${s_arg.trim()}`)
        if(a_s_custom_redirection_symbols_not_supported_yet.indexOf(s_arg.trim()) != -1){
            console.log(`'${s_command}': command will not be run: the following redirection symbols are not yet supported: ${a_s_custom_redirection_symbols_not_supported_yet.join(',')}`)
            return null;
        }
    }



    var s_command = a_s_arg.join(' ');
    var s_path_file__redirect_to_or_from = '';
    
    var s_redirection_symbol = "";

    if(a_s_biggerthan_symbol.length == 1){
        s_redirection_symbol = ">"
    }
    if(a_s_smallerthan_symbol.length == 1){
        s_redirection_symbol = "<"
    }

    if(
        a_s_biggerthan_symbol.length == 1 
        ||
        a_s_smallerthan_symbol.length == 1
    ){
        var a_s_part__command = a_s_arg.join(" ").split(s_redirection_symbol);
        var s_command_before_redirection_symbol = a_s_part__command[0].trim();
        var s_command_after_redirection_symbol = a_s_part__command[1].trim();
        // console.log(s_redirection_symbol)
        // var o_stat = await Deno.stat(s_command_after_redirection_symbol);
        // if(!o_stat.isFile){
        //     console.log(`${s_command_after_redirection_symbol}: the part after the redirection symbol must be a name of a file, everything else is not supported yet`);
        //     return null;
        // }
        s_path_file__redirect_to_or_from = s_command_after_redirection_symbol;
    }
    var n_ts_ms_start = new Date().getTime();

    

    if(s_redirection_symbol == "<"){
        var o_file_redirect_from = null;
        try{
            var o_stat = await Deno.stat(
                s_command_after_redirection_symbol
            );
            o_file_redirect_from = await Deno.open(
                s_command_after_redirection_symbol
            );
        }catch(o_e){
            console.log(o_e.message);
            console.log(`'${s_command}': command wont be run, '${s_command_after_redirection_symbol}': seems to be an non existing file name to redirect output from`);
            return null;
        }
    }
    if(!s_command_before_redirection_symbol){
        s_command_before_redirection_symbol = s_command;
    }
    // console.log(s_command.split(" "))
    console.log(`'${s_command}': trying to run command inside folder: '${Deno.cwd()}'`);
    const o_process = await Deno.run(
        {
            cmd:s_command_before_redirection_symbol.split(" "),
            stdout: "piped",
            stderr: "piped",
            stdin: (s_redirection_symbol == "<") ? o_file_redirect_from.rid : 'inherit'
        }
    );
    if(s_redirection_symbol == ">"){
        var o_file_redirect_to = null;
        try{
            o_file_redirect_to = await Deno.open(s_command_after_redirection_symbol, {
                read: true,
                write: true,
                create: true,
            });
        }catch(o_e){
            console.log(o_e.message);
            console.log(`'${s_command}': command wont be run, '${s_command_after_redirection_symbol}': seems to be an invalid file name to redirect output to`);
            return null;
        }

        // const o_writable_stream = await writableStreamFromWriter(o_file_redirect_to);
        // const o_readable_stream__stdout = readableStreamFromReader(o_process.stdout);
        // const o_readable_stream__stderr = readableStreamFromReader(o_process.stderr);
        // const o_readable_stream__merged = mergeReadableStreams(
        //     o_readable_stream__stdout,
        //     o_readable_stream__stderr
        // );
        // o_readable_stream__merged.pipeTo(o_writable_stream).then(
        //     // () => console.log("pipe join done")
        // );
    }

    // output needs to be read before .status() or .close()!!!!!
    const a_n_byte__stdout = await o_process.output();
    const a_n_byte__stderr = await o_process.stderrOutput();

    const s_stderr = new TextDecoder().decode(a_n_byte__stderr);
    const s_stdout = new TextDecoder().decode(a_n_byte__stdout);

    
    var n_ts_ms_end = new Date().getTime();
    const { code: n_return_code } = await o_process.status();

    // the programmer has to check for errors by him-/her- self
    if(
        n_return_code != 0 && s_stderr != "" // a few programms will throw an error but do not have an return code other than 0
        ||
        n_return_code != 0 // 
    ){
        var s_error = `
            error happened while running command: ${s_command}
            return code is:
            ${n_return_code}
            stderr is:
            ${s_stderr} 
            stdout is:
            ${s_stdout} 
        `
        throw new Error(s_error)
    }
    await o_process.close();


    var o_command = new O_command(
        n_ts_ms_start,
        n_ts_ms_end,
        n_ts_ms_end-n_ts_ms_start,
        s_command, 
        o_process,
        n_return_code,
        a_n_byte__stdout, 
        a_n_byte__stderr,
        s_stdout,
        s_stderr
    )
    
    // returns a promise that resolves when the process is killed/closed
    
    if(s_redirection_symbol == ">"){
        const b_written = await o_file_redirect_to.write(a_n_byte__stdout);
    }

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