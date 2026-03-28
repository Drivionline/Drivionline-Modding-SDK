# General Technical Information

Drivionline is a project in active development, primarily focused on Lua modding and multiplayer systems.

### Player and Vehicle Management

Small, real-time data—such as player vehicle selection and movement inputs—are sent as packets to the C# game server using Godot's `PacketPeerUDP` class. Depending on the context, the C# game server then broadcasts this data to other players. We are doing our absolute best to ensure maximum performance and high speed.

### Lua Modding System

Lua scripts actually connect to the C# game server via MoonSharp. 
By calling the APIs on the C# side, Lua essentially just sends commands to the client over an encrypted TCP channel.
In Godot, these packets are routed to the appropriate managers depending on the situation, and the commands are processed accordingly.

### Hardware Support

Since my personal steering wheel is a DIY FFB system built with a simple Arduino Leonardo, the game currently lacks highly detailed FFB support.
I am trying to improve it as much as possible, but features like shifter support are still under development.
The SDL3 library is used to handle communication between the hardware and Godot.
Basic FFB along with throttle, brake, and clutch support is available, though it is not heavily advanced yet.
However, since SDL3 is an advanced library, it natively supports other commercial steering wheel sets.

### UDP Packet Sizes

On the UDP side, I am actively trying to keep packet sizes as small as possible.
To give a general idea about packet sizes: real-time movement data is sent 20 times per second. While the exact size of the movement data may change with future updates, it generally ranges between 30 and 40 Bytes.

### Private Server Setup

If you want to host a private server, you will need to rent a dedicated server from any hosting provider.
For setup details: https://drivionline.com/docs/?lang=EN&class=1-Main&doc=3-server_setup.md#server-setup-and-details

### Mod Distribution 

Any mod file (which must be in .zip format) placed in the `server_mods` folder of your private server files can be downloaded by all players joining the server. These files are distributed over the 50505 TCP (HTTP) port. The default mods included in the server files are intended for basic development and core gameplay testing.

If a mod file in the `server_mods` folder is modified or a new file is added, the system automatically detects this and sends a re-download command to the clients. The game identifies exactly which file has changed and downloads it automatically.

### Information About Map and Car Mods

To create map or car mods, all you need is a 3D modeling program (like Blender) and some basic modeling knowledge. 
Modding support is designed to be straightforward, and we are striving to keep it as simple as possible. You must pack your models and configuration files into a .zip archive, which will serve as your main mod file. We use the `.GLB` format for model files, allowing you to include animations, textures, and materials natively.