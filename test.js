import {O_command, f_o_command} from "./O_command.module.js"

var s_command = `echo 'hello' > hello.txt`
console.log(`test: ${s_command}`)
var o_command = f_o_command(s_command.split(' '))
