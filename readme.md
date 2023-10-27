# usage

## run a simple command 
important, 'bash -c ' will be added to the command as a prefix
this is because some commands with certain arguments won't work without the "bash -c" prefix
```javascript 

var o_command = await f_o_command(`echo hello world`);// runs `bash -c 'echo hello world'`
console.log(o_command.s_stdout) // hello world
```
## run a simple command without prefix 
to get full control and run exactly whatever you desire, you have to pass true as a second argument 
```javascript 
var o_command = await f_o_command(`echo hello world`, null, true); // runs 'ls -latrh'
console.log(o_command.s_stdout) // hello world
```
## run a non existing command 
this will likely throw a Deno error " 
`running command: 'non_exsitnig_binary', in folder: '....'
error: Uncaught NotFound: No such file or directory (os error 2)
    const o_process = await Deno.run(
`
```javascript
var o_command = await f_o_command(`non_existing_binary`);
console.log(o_command.s_stderr) // bash: line 1: non_existing_binary: command not found\n
```

## redirect output
for the moment only simple redirections work 
### >
```javascript
await f_o_command(`echo lol > lol.txt`);
```
### <
```javascript
await f_o_command(`less < lol.txt`);
```
## continious output
some commands may give output while still being run, if a callback function is present it will be run upon output retrieval
```javascript
let o_command = await f_o_command(
    `ping 1.1.1.1 -c`
    (s_partially_output, a_n_u8)=>{
        // 
        console.log(s_partially_output)// console log adds a newline, 
        await Deno.writeAll(Deno.stdout, a_n_u8)//a_n_u8 contains the partially output of the command as bytes (often this represents a string so 's_partially_output' can be used for convenience)
    }
);
```