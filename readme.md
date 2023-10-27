<!-- {"s_msg":"this file was automatically generated","s_by":"f_generate_markdown.module.js","s_ts_created":"Fri Oct 27 2023 14:17:55 GMT+0200 (Central European Summer Time)","n_ts_created":1698409075435} -->
# import library
```javascript
import {
    O_command,
    f_o_command
} 
// from "https://deno.land/x/f_generate_markdown@0.7/mod.js"
from "./mod.js"

```
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
this will throw an error, therefore we have to catch it if we want the script to proceed
```javascript
try {
    var o_command = await f_o_command(`non_existing_binary`);
} catch (error) {
    console.log(error);
    // error: Uncaught (in promise) Error: {
    //     "s_msg": "error happened while running command",
    //     "o_command.s_command": "bash -c non_existing_binary",
    // ....
}

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

///md:  this will output 
// s_partial_output
// PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
// 64 bytes from 1.1.1.1: icmp_seq=1 ttl=54 time=21.2 ms
// s_partial_output
// 64 bytes from 1.1.1.1: icmp_seq=2 ttl=54 time=27.7 ms
// s_partial_output
// 64 bytes from 1.1.1.1: icmp_seq=3 ttl=54 time=18.1 ms

```