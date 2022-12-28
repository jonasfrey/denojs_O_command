import { f_o_command } from "https://deno.land/x/o_command@0.1/O_command.module.js"


var s_command = `ls`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)


var s_command = `echo lol > lol.txt`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)

var s_command = `less < lol.txt`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)


var s_command = `sensors`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
