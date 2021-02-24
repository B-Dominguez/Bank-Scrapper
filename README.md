# Bank-Scrapper
Scrapper for latest transactions on Banco Santander. This is simply an introductory excercise to understand  scrappers.

### Description
Scraps latest transactions data to given output json file, using Chromium on Headless Mode. Must give DNI (rut), Bank's web password and desired output file for json scrapped data. More info on package.json 

### Execution
* `yarn install`
* `yarn santander RUT PASSWORD OUTPUT.json`  or `yarn start RUT PASSWORD OUTPUT.json`

### Environment
* OS: Ubuntu 20.04.2 LTS on WSL2
* node: -v15.7.0
* yarn: -v1.22.5
