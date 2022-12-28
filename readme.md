# usage
## run a simple command 
```javascript 
var s_command = `ls`
var o_command = await f_o_command(s_command.split(' '));
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