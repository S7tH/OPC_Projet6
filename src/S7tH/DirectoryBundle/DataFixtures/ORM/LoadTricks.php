<?php 

namespace S7tH\DirectoryBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use S7tH\DirectoryBundle\Entity\Tricks;
use S7tH\DirectoryBundle\Entity\Category;
use S7tH\DirectoryBundle\Entity\Image;

class LoadTricks implements FixtureInterface
{
  public function load(ObjectManager $manager)
  {
    
    $listNames = array('Trick one', 'Trick two', 'Trick three');
    $listCategory = array('cat one', 'cat two', 'cat three');
    
    $categories = [];
 
  

    foreach ($listCategory as $cat)
    {
      $category = new Category;
      $category->setName($cat);
      $manager->persist($category);
      $categories = array($category);
    }


    
    foreach ($listNames as $name)
    {
      foreach ($categories as $cats)
      {
      
        $trick = new Tricks;
  
        $image = new Image;
        $image->setUrl('https://cdn.pixabay.com/photo/2016/08/09/21/54/yellowstone-national-park-1581879_960_720.jpg');
        $image->setAlt('Photo test.jpg');
      
        $trick->setName($name)
              ->setDescription('description de '.$name)
              ->setCategory($cats)
              ->setImage($image);

      
        $manager->persist($trick);
      }
    }
    
    $manager->flush();
  }
}