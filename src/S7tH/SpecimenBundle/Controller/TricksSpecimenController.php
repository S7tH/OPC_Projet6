<?php

namespace S7tH\SpecimenBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Tricks;
use S7tH\DirectoryBundle\Entity\Category;
use S7tH\DirectoryBundle\Entity\Image;

use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/*exceptions*/
use Symfony\Component\Yaml\Exception\ParseException;


class TricksSpecimenController extends Controller
{
    public function loadspecimenAction()
    {
        // Store the file tricks.yml into the class finder.
        $finder = new Finder();
        $finder->files()->in(__DIR__.'/../../../../app/files');

        // Instantiate the entities
        $trick = new Tricks();
        $category = new Category();
        $image = new Image();

        foreach ($finder as $trickfile) 
        {
            $contentfile = Yaml::parse(file_get_contents($trickfile));
        }

        //we call the manager for save our entities in the db
        $em = $this->getDoctrine()->getManager();

        //we call the repository for call our entities in the db
        $repoImage = $em->getRepository('S7tHDirectoryBundle:Image');
        $repoCategory = $em->getRepository('S7tHDirectoryBundle:Category');

        //We recover the categories
        foreach($contentfile as $element => $content)
        {
            // Clone the entity to respect the loop.
            $categories = clone $category;
            $categories->setName($content['category']);

            //recover the name of the category object for check if is already exist or not
            $catname = $categories->getName();

            //recover the entity with the same name
            $findname = $repoCategory->findOneBy(array('name' => $catname));
            

            // if the id don't exist we save the new category else he is already exist in the db
            if ($findname === null)
            {
                //create the request sql for each entity
                $em->persist($categories);
                //send the requests and save our categories in the db
                $em->flush();
            }
        }
        


        //and we repet the operation for images 
         foreach($contentfile as $element => $content)
        {
            // Clone the entity to respect the loop.
            $images = clone $image;
            $images->setUrl($content['image']);
            $images->setAlt('Image lost');

            //create the request sql for each entity
            $em->persist($images);
            //send the requests and save our categories in the db
            $em->flush();
        }
  
  
        foreach($contentfile as $element => $content)
        {
            // Clone the entity trick to respect the loop.
            $tricks = clone $trick;
            $tricks->setName($element);
            $tricks->setDescription($content['description']);

            $img = $repoImage->findOneBy(array('url' => $content['image']));
            $tricks->setImage($img);

            $cat = $repoCategory->findOneBy(array('name' => $content['category']));
            $tricks->setCategory($cat);
            
            //create the request sql for each entity
            $em->persist($tricks);
            //send the requests and save our categories in the db
            $em->flush();
        }
    }
}