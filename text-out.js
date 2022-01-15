const description = `
RHI-76 1h. Opfølgning på SP SUP LDAP fil-leverance. Kommunikation med Aliah.

RHI-76 1h | Opfølgning på SP SUP LDAP fil-leverance. Kommunikation med Aliah.


RHI-99 2h Medarbejder stamdata Analyse OK
RHI-76 1.5h Udvikling og test OK

RHI-99 -2h Medarbejder stamdata Analyse OK
RHI-76 -1.5h Udvikling og test OK
RHI-99 -32h Medarbejder stamdata Analyse OK
RHI-89 -4.32h Medarbejder stamdata Analyse OK
RHI-79 -7,32h Medarbejder stamdata Analyse OK

RHI-199-132h Medarbejder stamdata Analyse OK
RHI-189-24.32h Medarbejder stamdata Analyse OK
RHI-99- -32h Medarbejder stamdata Analyse FAIL
RHI-89- -4.32h Medarbejder stamdata Analyse FAIL
RHI-63- -7,32h Medarbejder stamdata Analyse FAIL
RHI-176--1.5h Udvikling og test FAIL


HP-2234h FAIL

HP-223 4h OK

IOS-543 10,3h OK

HP-223 4h OK IOS-543 10,3h OK

This should be ok IOS-543 13.40h OK
This should be ok IOS-543 13.1h| OK
This should be ok IOS-543 13.86hh| OK
This should be ok IOS-543 13.45.78hh| Fail
This should be ok IOS-543 13.45,49h| Fail

IOS-543-13.45hh OK

:IOS-543-13.45h OK

This should be ok (IOS-543-13.245h) Fail

This should be ok (IOS-543-13.24h) OK

This should be ok [IOS-543-13.76h] OK

HP-223 h FAIL

HGP- 23 1h FAIL


`

console.log(description)

let objList = []
if (description != '') {
  const foundJiraCodes = description.match(/(?:[a-zA-Z]*)-\d{1,}[\s|-]\d{1,3}([.|,]?\d{1,2})?h/gm)

  objList =
    foundJiraCodes && foundJiraCodes.length > 0
      ? foundJiraCodes.map((o) => {
          const hours = o.match(/(?:[\d|.|,])*(?=h)/gm)
          const hoursToDot = hours[0].replace(',', '.')
          const key = o.match(/.*(?=[-|\s](?:[\d|.|,])*h)/gm)

          return key && key.length > 0 && hoursToDot != ''
            ? { key: key[0], hours: hoursToDot }
            : false
        })
      : []
}

console.log('OBJ List:', objList)
