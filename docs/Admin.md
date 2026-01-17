# Admin Workspace/Backstage Guide

This document describes how live agora instance admins can create agoras and manage their access control.

1. Navigate to `<your-agora-url>/admin.html`
2. Enter the admin password to unlock the admin panel
3. Here you can create agoras and manage their access control (read and edit passwords)

## Creating an agora

Click "create agora" and enter a name for the new Live Agora (lowercase, without spaces or special characters)

- An agora with one space is created at `<your-agora-url>/<agora-name>`
- Default access settings:
  - read access: public (you can set this to password protected if you wish)
  - edit access: a random password is generated. This password can be used to edit the contents of the agora (space list and display settings) as well as the contents of spaces within the agora

## Going further: agora backstage

Each agora has a "backstage" in which the space list and their access settings can be set more granularly. To access the backstage:

1. navigate to `<your-agora-url>/<agora-name>?backstage`
2. enter the agora edit password to unlock the backstage

Here you can:
- create links to other agoras (which will appear in the top navigation bar)
- enable other spaces within the agora (which will also appear in the top navigation bar, on the bottom level)
  - enable/disable the space
  - name: space name as it appears in the top navigation bar
  - edit access:
    - default: password (same as backstage)
    - public (no password)
    - custom password (this can be set per space)
  - archive view mode: 
    - default: unchecked (you enter the space with a nametag and can enter the video call)
    - checked: no presence