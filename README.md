# cloths-shop-
assignment 3 

In this project we have 2 files:
DbUtils - contains all DB methods: insert, select, update and delete
Server - contains all API calls as you can see in the API table attached

Packages: in addition to the basic that we learned about in class we used squel package to build sql queries more easily and moment package that helped us with dates formatting.
Port listening to: 4000
Note: we added validation test in server side as well as we will do it in client side just to be sure as explained in class.
Top 5 – selects from products added in the past week and are the best seller in the shop.
Restore password – optional only after filling user name (unique) favorite color and pet. If all this 3 match the user will get his password.
Recommended products – first by his favourite color and if didn’t find anything search products matches to his first category in list.
Users inserted already:
Admin: 
Username: a Password: a
Username: b Password: b
Regular:
Username: c Password: c
Username: d Password: d
Username: e Password: e
Username: f Password: f
Username: g Password: g
Username: h Password: h
Username: i Password: i
Username: j Password: j
Tables:
Users: username, userPassword, userMail, categories[], country, color, pet, admin
