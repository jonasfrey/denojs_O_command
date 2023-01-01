# usage

## run a simple command 
important, 'bash -c ' will be added to the command as a prefix
this is because some commands with certain arguments won't work without the "bash -c" prefix
```javascript 

var o_command = await f_o_command(`ls -latrh`.split(' '));// runs 'bash -c ls -latrh'
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
```
## run a simple command without prefix 
to get full control and run exactly whatever you desire, you have to pass true as a second argument 
```javascript 
var o_command = await f_o_command(`ls -latrh`.split(' '), true); // runs 'ls -latrh'
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
```
## run a non existing command 
this will likely throw a Deno error " 
`running command: 'non_exsitnig_binary', in folder: '....'
error: Uncaught NotFound: No such file or directory (os error 2)
    const o_process = await Deno.run(
`
```javascript
var s_command = `non_exsitnig_binary`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
```

## redirect output
for the moment only simple redirections work 
### >
```javascript
var s_command = `echo lol > lol.txt`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
```
### <
```javascript
var s_command = `less < lol.txt`
var o_command = await f_o_command(s_command.split(' '));
console.log(o_command)
console.log(o_command.s_stdout)
console.log(o_command.s_stderr)
```