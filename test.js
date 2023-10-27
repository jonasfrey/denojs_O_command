// import {O_command, f_o_command_old as f_o_command} from "./O_command.module.js"
import {O_command, f_o_command} from "./O_command.module.js"

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
