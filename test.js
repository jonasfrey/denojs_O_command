//readme.md:start
//md: # import library
import {
    O_command,
    f_o_command
} 
// from "https://deno.land/x/f_generate_markdown@0.7/mod.js"
from "./mod.js"
//readme.md:end

let a_s_command = [
    `ls -latrh`,
    `ls -latrh`,
    `echo 'this should work'`,
    `echo 'hello' > hello.txt`,
    `echo 'hello line 2' >> hello2.txt`,
    `less < hello.txt`,
    `less < hello.txt`,
    `sensors`,
    `nvidia-smi`,
    `nonexistingcommand &> nonexistingfile.txt`
]
for(let s_command of a_s_command){
    console.log(`running command ${s_command}`)
    try {
        let o_command = await f_o_command(s_command);
        console.log(o_command)
    } catch (error) {
        console.log(error)
    }
    console.log('---')

}
a_s_command = [
    `ping 1.1.1.1 -c 3`,
    `ping asdf.non.existing.domain.asdf -c 3`,
]
// commands with continiuous output
for(let s_command of a_s_command){

    console.log(`running command ${s_command}`)
    try {
        let o_command = await f_o_command(s_command, 
            async function(s_tmp_output, a_n_u8){
                console.log(`s_tmp_output:`)
                await Deno.writeAll(Deno.stdout, a_n_u8)
            }
        );
        console.log(o_command)
    } catch (error) {
        console.log(error)
    }
    console.log('---')

}



//start readme 
//readme.md:start

//md: ## run a simple command 
//md:  important, 'bash -c ' will be added to the command as a prefix
//md: this is because some commands with certain arguments won't work without the "bash -c" prefix

var o_command = await f_o_command(`echo hello world`);// runs `bash -c 'echo hello world'`
console.log(o_command.s_stdout) // hello world

//md: ## run a simple command without prefix 
//md: to get full control and run exactly whatever you desire, you have to pass true as a second argument 
var o_command = await f_o_command(`echo hello world`, null, true); // runs 'ls -latrh'
console.log(o_command.s_stdout) // hello world

//md: ## run a non existing command 
//md: this will throw an error, therefore we have to catch it if we want the script to proceed
try {
    var o_command = await f_o_command(`non_existing_binary`);
} catch (error) {
    console.log(error);
    // error: Uncaught (in promise) Error: {
    //     "s_msg": "error happened while running command",
    //     "o_command.s_command": "bash -c non_existing_binary",
    // ....
}

//md: ## redirect output
//md: for the moment only simple redirections work 
//md: ### >
await f_o_command(`echo lol > lol.txt`);
//md: ### <
await f_o_command(`less < lol.txt`);

//md: ## continious output
//md: some commands may give output while still being run, if a callback function is present it will be run upon output retrieval

var o_command = await f_o_command(
    `ping 1.1.1.1 -c 3`,
    async function(
    s_partial_output,
    a_n_u8__partial_output
    ){
        // s_partial_output contains the textdecoded TypedArray
        console.log('s_partial_output')
        await Deno.writeAll(Deno.stdout, a_n_u8__partial_output)
    }
);
// output
// 
// s_partial_output
// PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
// 64 bytes from 1.1.1.1: icmp_seq=1 ttl=54 time=21.2 ms
// s_partial_output
// 64 bytes from 1.1.1.1: icmp_seq=2 ttl=54 time=27.7 ms
// s_partial_output
// 64 bytes from 1.1.1.1: icmp_seq=3 ttl=54 time=18.1 ms

//readme.md:end