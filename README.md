Snowtrickmania
==============

A Symfony project created on June 28, 2017, 12:49 pm.

Snowtrickmania

A Symfony project created on June 28, 2017, 12:49 pm.

After copied this repository github from this address https://github.com/S7tH/OPC_Projet6.git on your computer 

    1) Adapt your data base parameters in the following folder : "app/config/parameters.yml"

    2 )Create your Databse with the following command : "php bin/console doctrine:database:create"

    3) Generate your tables : "php bin/console doctrine:schema:update --force

    4) Create a Super_Admin :

        php bin/console fos:user:create yournameuser yourmail@example.com yourpassword --super-admin

        (remove --super-admin if you want create a simple account without rights)
        
    5) Import a sample of several pre-made tricks : "php bin/console tricks:specimen"

    In prod mod, remove the file config.php in the web folder

The site is operational

