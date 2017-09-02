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
    public function loadspecimenAction($rootParameter)
    {
        // Store the file tricks.yml into the class finder.
        $finder = new Finder();
        //recover the kernel root parameter (service.yml from our command container call)
        $finder->files()->in($rootParameter);

        // Instantiate the entities
        $trick = new Tricks();
        $category = new Category();
        $image = new Image();
        $catArray = [];
        $catName = null;

        foreach ($finder as $trickfile) 
        {
            $contentfile = Yaml::parse(file_get_contents($trickfile));
        }

        //we call the manager for save our entities in the db
        $em = $this->getDoctrine()->getManager();

        //we call the repository for call our entities in the db
        $repoCategory = $em->getRepository('S7tHDirectoryBundle:Category');

        //We recover the categories
        foreach($contentfile as $element => $content)
        {
            //recover the entity with the same name for check if is already exist in the db
            $findname = $repoCategory->findOneBy(array('name' => $content['category']));

             //we check if the name of this category is not already persisted
            if($findname === null)
            {
                    // Clone the entity to respect the loop.
                    $categories = clone $category;
                    $categories->setName($content['category']);
                    $catName = $categories->getName();

                    if(in_array($catName, $catArray) === false)
                    {
                        $em->persist($categories);
                    }
            }
            //we stock the name of this category in array for the next persist condition.
            //this is avoid to persist 2 times the same categories and return an error from the sql request (category must be exist one time and unique in the db)
            $catArray = [$catName];
        }
      

        //we call the repository for call our entities in the db
        $repoImage = $em->getRepository('S7tHDirectoryBundle:Image');

        //We recover the categories
        foreach($contentfile as $element => $content)
        {
            //recover the entity with the same name for check if is already exist in the db
            $findname = $repoImage->findOneBy(array('alt' => $content['alt']));
            //we check if the name of this category is not already persisted
            if($findname === null)
            {
                // Clone the entity to respect the loop.
                $images = clone $image;
                $images->setUrl($content['url']);
                $images->setAlt($content['alt']);
                $images->setSpecimen($content['specimen']);

                //create the request sql for each entity
                $em->persist($images);
            }
        }
        //send the requests and save our categories in the db
        $em->flush();
        
        //we call the repository for call our entities in the db
        $repoTricks = $em->getRepository('S7tHDirectoryBundle:Tricks');

        foreach($contentfile as $element => $content)
        {
            //recover the entity with the same name for check if is already exist in the db
            $findname = $repoTricks->findOneBy(array('name' => $element));
            //we check if the name of this category is not already persisted
            if($findname === null)
            {
                // Clone the entity trick to respect the loop.
                $tricks = clone $trick;
                $tricks->setName($element);
                $tricks->setDescription($content['description']);

                $img = $repoImage->findOneBy(array('alt' => $content['alt']));
                $tricks->setImage($img);

                $cat = $repoCategory->findOneBy(array('name' => $content['category']));
                $tricks->setCategory($cat);
            
                //create the request sql for each entity
                $em->persist($tricks);
            }
        }
            //send the requests and save our categories in the db
            $em->flush();
    }
}
