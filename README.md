# convert-msdocs

A command line interface to convert Microsoft files (.docx, .xlsx, .pptx) to pdf using Cloudmersive srvice

---

## Installation

This package is available on [npm](http://npmjs.com) as `convert-msdocs`.

```sh
npm install --global convert-msdocs
```

## Usage

This simple commands does the following:

- lists the folders found in the current folder.
- finds the last updated folder inside the selected folder
- creates a folder named SOURCE with two subfolders: NATIVE and PDF at the same level as the selected working folder.
- copies the (ms files) in the last updated folder to NATIVE and

- converts these files and puts them in PDF

The conversion is done using the service from cloudmersive.com. You need, therefore, to create
an api key and set it with the command

```sh
convert-msdocs --key <APIKEY>
```

then run

```sh
convert-msdocs
```
