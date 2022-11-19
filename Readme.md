
## Second Exchange SDK 

For people developing clients and services , this is a core services that lets them develop usefull applications like Front End for tech stack as below.

1. If you are intending to build something simple , that uses nostr 
2. If you like to build something related to the UI check our UI-SDK 
3. This is just a composed form of services that lets you develop faster


## Features 

1. Create memonic pairs for the client, 
2. add your pool or find existing pools or relays 
3. Build schema like events and relay them.
3. Store files over hypercore and relay them.
4. Fetch Events for the required fields 
5. Low on dependency and has tested features and tests 
6. Typescript Enabled
7. Query events like `Get this from this Relay`


## How to use ?

- Add the SDK in your project 

1. `import {Application}  from '2nd.SDK'`
2. `const init = new Application()`

The above will initialize a new Application class that can be accessed and methods exposed directly for use such as `init.keys()` or `init.relayPool()` and so on. 

- Make sure that you init the above class , and then you can explore other classes based on your need, like `Keys`,  though most of the basic instances are available with new classes that you instantiate in your project and lets you do most of the methods exposed as per needs.

## Using UI Service 

1. Packaging the React UI services that can be used as context 

## Ship Faster Services and Products

## API 

- `Application`
- `Application.Relay`
- `Application.Logger`
- `Events.publish`
- `Pools.api`
- `Keys.api`

