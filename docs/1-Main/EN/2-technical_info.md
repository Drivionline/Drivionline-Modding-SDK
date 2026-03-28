# General Technical Information

Drivionline is an evolving project with a core focus on Lua modding and Multiplayer systems.

### Player and Vehicle Management

Instantaneous and small data, such as vehicle selection and movement data, are sent to the C# game server using Godot's PacketPeerUDP class. The server then broadcasts this data to other players as needed. We are doing our best to ensure maximum performance and speed.

### Lua Modding System

Lua scripts are integrated into the C# game server via MoonSharp. Lua interacts with the C# APIs to send commands to the client over an encrypted TCP channel. In Godot, these packets are distributed to the relevant managers where the commands are processed.

### Hardware Support

Since my own steering wheel setup is a DIY FFB system built with an Arduino Leonardo, high-detail Force Feedback (FFB) is currently limited. I am working to improve this, including better gear shifter support.

We use the SDL3 library for communication between hardware and Godot.

Basic FFB and support for gas, brake, and clutch pedals are available, though they are still being refined.

Because SDL3 is a comprehensive library, it supports most standard steering wheel sets.

### UDP Packet Sizes

We strive to keep UDP packet sizes as low as possible for efficiency.

Movement data is synchronized 20 times per second.

While sizes may vary with updates, packet sizes typically range between 30-40 Bytes.

### Private Server Setup

To host a private server, you will need to rent your own Linux VPS.
For detailed installation instructions, visit: Server Setup Guide

### Mod Distribution

Any mod file (must be in .zip format) placed in your private server's server_mods folder is automatically distributed to all joining players via TCP port 50505 (HTTP). Default mods included with the server files are intended for core gameplay and development.

If a mod file in the server_mods folder is modified or added, the system automatically detects this and sends a re-download command to players, ensuring they only download the changed files.

### Map and Vehicle Modding

To create Map or Vehicle mods, you only need a 3D modeling program like Blender and basic modeling knowledge.

We aim to keep modding support as simple as possible.

Models and metadata should be packed into a .zip file.

We use the .GLB format for models, which can include animations, textures, and materials.