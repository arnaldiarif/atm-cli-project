# ATM CLI Simulation

[![Made with Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://www.mysql.com/)
[![Commander.js](https://img.shields.io/badge/Commander.js-CLI-orange)](https://github.com/tj/commander.js)
[![Inquirer](https://img.shields.io/badge/Inquirer.js-Prompt-yellow?logo=inquirer)](https://github.com/SBoudrias/Inquirer.js)

An Indonesian command-line based ATM simulation application built using Node.js and MySQL.
Created as a practice project for Digital Skill Fair 39.0.

## Features
- Register Account (Name, PIN)
- Login to account
- Check balance (`check-balance`)
- Deposit funds (`deposit`)
- Withdraw cash (`withdraw`)
- Transfer funds between accounts (`transfer`)
- View transaction history (`histori-transaksi`)

## Tools
- Node.js + Commander.js
- MySQL (via MySQL2)
- Inquirer CLI
- MySQL Workbench (for database design)

##  How to Run
1. Clone repository
2. Install dependency on your terminal: npm install
3. Import data `atm.sql`
4. Run on your terminal: node atm.js

## Menu
![screenshot](./SS/Screenshot-menu.png)

## Register
![screenshot](./SS/Screenshot-register.png)

## Login
![screenshot](./SS/Screenshot-login.png)

## Deposit
![screenshot](./SS/Screenshot-deposit.png)

## Withdraw
![screenshot](./SS/Screenshot-withdraw.png)

## Transfer
![screenshot](./SS/Screenshot-transfer.png)

## Check Balance
![screenshot](./SS/Screenshot-check.png)

## Transaction History
![screenshot](./SS/Screenshot-history.png)

## Diagram Database
![diagram](./SS/atm-erd.png)

## Credits
- Arnaldi Arif
