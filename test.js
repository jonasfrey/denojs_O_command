import {O_command, f_o_command} from "./O_command.module.js"

var s_command = `ls -latrh`
console.log(`simple ls : ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `ls -latrh`
console.log(`simple ls running with f_o_command(..., true) : ${s_command}`)
var o_command = await f_o_command(s_command.split(' '), true)
console.log(o_command)

var s_command = `echo 'this should work'`
console.log(`simple echo : ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `echo 'hello' > hello.txt`
console.log(`test echo to non existing file : ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `echo 'hello line 2' >> hello2.txt`
console.log(`test append echo to non existing file: ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `less < hello.txt`
console.log(`redirect file into less: ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `less < hello.txt`
console.log(`redirect file into less: ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)

var s_command = `sensors`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)

var s_command = `nonexistingcommand &> nonexistingfile.txt`
console.log(`write stderr and stdout from command to file: ${s_command}`)
var o_command = await f_o_command(s_command.split(' '))
console.log(o_command)