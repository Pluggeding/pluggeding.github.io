## Native Apps


This document is a theoretical reference of possible native plugins (apps) ie those that run in the same scope as origin and do not need to be encapsulated in an `<iframe>`.


----------------------


### Drive (prebuilt)

Default use IndexedDB for save all user files

> Note: The Native File System API (formerly known as the Writeable Files API), is available behind a flag in Chrome 77 and later, and should begin an origin trial in Chrome 78 (stable in October).
This can be considered **"the first big barrier"** that differs web apps from native apps. We hope to explore it as soon as available.
>
> font: https://developers.google.com/web/updates/2019/08/native-file-system


Methods for this managment:

```none
  -- save: save file or files ... binary data format
  -- delete: delete specific file or files in "folder"
  -- folder: create virtual directory reference
  -- list: list files and folders
  -- share: under consideration
```

Possible methods call:

```javascript
/**
 * Save file
 * Reurn "metadata":
 *   -- folder: virtual diretory
 *   -- name: file name (with extension)
 *   -- size: original file size
 *   -- datetime: date time of saved action
 *   -- signature: datachet signature of private key
 *   -- data: encrypted content (file)
 *   -- ext: file extension
 *   -- type: file type (text|image|audio|video)
 *   -- tag: tagged or empty `String`
 */

Drive.save(file, filename, format).then(metadata => {
    if ( metadata ) {
        console.log('File has been saved! ', metadata)
    } else {
        console.log('Failed to save file!')
    }
}).catch(console.error)

Drive.save({
    /**
     * Save on specific folder ... create if non exists - default root "/"
     * If is only property in `Object` ... "folder" create new folder (same equal `Drive.folder()`)
     */
    folder: folder,
    file: file,     // RAW file (binary)
    name: filename, // file name (and extension) - required
    format: format, // file format RAW/base64/Buffer
    tag: String     // arbitrary tag for this file
}).then(metadata => {
    if ( metadata ) {
        console.log('File has been saved! ', metadata)
    } else {
        console.log('Failed to save file!')
    }
}).catch(console.error)

Drive.delete(filename).then(result => console.log(result)).catch(console.error)

Drive.delete({
    folder: folder, // if omited, delete filename in root "/"
    name: filename  // if omited, delete all files in folder
}).catch(console.error)

Drive.folder(name).then(result => console.log(result)).catch(console.error)

Drive.list({
    folder: String, // default root "/"
    max: Number,    // max resultes pagination - default 50, max allowed 1000
    dirs: Boolean,  // ignore virtual directories and show only files - default false
    filter: Object  // optional filter/ignore nom matched results ... see more bout
}).then(list => {
    // Array metadata file(s)
    console.log(list)
}).catch(console.error)

/**
 Filter parameter object to list (ordered by precedencie):

{
    date: {
        min: Object, // optional - default Drive creation TimeStamp
        max: Object  // optional - default Date.now() TimeStamp
    },
    tag: String,     // optional - arbitrary tagged string previous saved file
    ext: String,     // optional - extension file name - optional eg: .txt|.png|.mp3|.mp4
    type: String     // optional file type - text|image|video|audio
}
*/
```

-----------------------

### Notes

Save notes audio|video|text|images with attach files, tags, colors, tasks and more ... use Drive to saving notes

Methods for this managment:

```none
  -- save: save notes
  -- delete: delete specific note(s)
  -- edit: edit specific note
  -- list: list notes
  -- share: under consideration
```

Possible methods call:

```javascript
Notes.save(Object).then(console.log).catch(console.error)
Notes.delete(Object).then(console.log).catch(console.error)
Notes.edit(Object).then(console.log).catch(console.error)
Notes.list(Object).then(console.log).catch(console.error)
```


-----------------------


### Contacts

Contacts is base of friends list and chat ... use Drive to saving contacts

> Note: The Contact Picker API begins an origin trial in Chrome 77 (stable in September).
This can be considered **"the second big barrier"** that differs web apps from native apps. We hope to explore it as soon as available.
>
> font: https://developers.google.com/web/updates/2019/08/contact-picker

Methods for this managment:

```none
  -- invite: send invite to another user
  -- accept: accept invite from other user
  -- add: add new contact from external resource (JSON|QRCode|Link|Object)
  -- find: get specific contat info
  -- edit: edit specific contact fields (personal use - eg: alias, avatar, location, notes, ...)
  -- list: list contacts
  -- block: block specific(s) contact(s) from your list
  -- delete: remove specific(s) contact(s) from your list
  -- share: under consideration

  -- events:
     -- on('invited'): when your receive invite from another user
     -- on('accepted'): when your invite request is accepted
```

Possible methods call:

```javascript
// invite sended by Web-Push API
Contacts.invite({
    target: Object, // another user public|private info for invite
    info: Object    // your contact info to send to another user
}).then(() => {
    // save waithing invite response ...
}).catch(console.error)

// when receive invite (by event)
Contacts.on('invited', data => {
    let info = data.detail
    // show invite handler UI ... in case "accept":
    Contacts.accept(info).then(console.log).catch(console.error)
})

// when your invite request is accepted
Contacts.on('accepted', data => {
    let info = data.detail
    // show accept popup UI ... by concepts use basic Notification API and save contact info
    Contacts.add(info).then(console.log).catch(console.error)
})

// find
Contatcs.find(reference).then(info => {
    info ? console.log(info) : console.log('Not found contact!')
}).catch(console.error)

// edit (request previous saved contact info, edit[save])
let info = Object
// manipule info ...
Contacts.edit(info).then(console.log).catch(console.error)

// list contacts
Contacts.list({
    max: Number,    // max results pagination - default 50, max allowed 1000
    filter: Object  // optional filter/ignore nom matched results ... see more bout
}).then(list => {
    // Array contact(s) info
    console.log(list)
}).catch(console.error)

/**
 Filter parameter object to list (ordered by precedencie):

{
    date: {
        min: Object,  // optional - default Contacts first creation TimeStamp
        max: Object   // optional - default Date.now() TimeStamp
    },
    tag: String,      // optional - arbitrary tagged string previous saved contact tag(s)
    blocked: Boolean, // optional - list blocked contacts (default false)
    origin: String,   // optional - list contacts by service reference
    more: ARBITRARY   // ADD MORE FILTERS BOLLOW
}
*/

// block specific or loot of contacts
let target = Object // specific target info or Array of Objects (targets)

Contacts.block(target).then(result => {
    console.log(result) // Array of results (Objects) or single Object
}).catch(console.error)

// delete specific or loot of contacts
let target = Object // specific target info or Array of Objects (targets)

Contacts.delete(target).then(result => {
    console.log(result) // Array of results (Objects) or single Object
}).catch(console.error)
```


-----------------------


### 2FA (Two Factory Authentication)

In Pluggeding access is governed by the use of encryption keys using the AuthChainJS network ... a second factor of access protection ensures more security in case of loss or loss of a device.


Second factor authentication mode uses three main strategies:


**OTP (One Time Passcode)**:

The one-time password method generates a random set of alphanumeric characters or a QRCode code that must be entered or scanned on another device to ensure access.

The devices used in the process must be on the same local network (if offline) or connected to the worldwide network (online) for the success of the operation.

> Note: An **offline** device cannot authenticate an **online** device and vice versa.


**TOTP (Time-based One-time Passwords)**:

This method expects a time-based authentication code (renewed every 30 seconds) to be manually entered.

Ideal for authentication even when one of the devices is **offline**.

If the second device is **online**, you can choose to use a QRCode for confirmation, in which case the code is transmitted over the network without the need for manual input.


**PUSH (Web-Push Notification)**:

This authentication method is based on Web-Push Notification and requires minimal user interference.

Notifications are sent to the other connected devices and the user just needs to "click" on the "authenticate" option to allow access.

This is the best method for use since the user will be fully aware of when authentication events occur.




Methods for this managment:

```none
  -- in development ...
```

Possible methods call:

```javascript
// in development ...
```

-----------------------
