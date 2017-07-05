<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Tricks;
/*end entities*/

/*for my form*/
use S7tH\DirectoryBundle\Form\TricksType;
/*end form*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/*call the request*/
use Symfony\Component\HttpFoundation\Request;

/*call the no http found exeption*/
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TricksController extends Controller
{
    public function indexAction()
    {
        //recover the repository
        $repository = $this->getDoctrine()
            ->getManager()
            ->getRepository('S7tHDirectoryBundle:Tricks')
            ;
        
        //recover all the entities
        $tricklist = $repository->findAll();
        
        return $this->render('S7tHDirectoryBundle:Tricks:index.html.twig', array(
            'tricklist' => $tricklist,
        ));
    }

    public function addAction(Request $request)
    {
        //create my tricks object entity
        $tricks = new Tricks();

        //create the formBuilder
        $form = $this->get('form.factory')->create(TricksType::class, $tricks);

        
        //if a form has been send so we are not displaying the form but send the form and if the values are ok
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $tricks contains the form values
                //we move our image in its folder.
                $tricks->getImage()->upload();

                //we save our entity in the db
                $em = $this->getDoctrine()->getManager();
                $em->persist($tricks);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Trick bien enregistrée.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_trickview', array('id' => $tricks->getId()));
        }

        //if any send, we are displaying the form
        return $this->render('S7tHDirectoryBundle:Tricks:add.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }

    public function editAction($id, Request $request )
    {
        //recover entity manager
        $em = $this->getDoctrine()->getManager();
        //recover the repository
        $repository = $em->getRepository('S7tHDirectoryBundle:Tricks');
        
        //recover the entity with the same id
        //$tricks is a filled object of Tricks entity
        $tricks = $repository->find($id);
        
        // if the id don't exist
        if (null === $tricks)
        {
            throw new NotFoundHttpException("Le trick ayant l'id ".$id." n'existe pas.");
        }

        //create the form
        $form = $this->get('form.factory')->create(TricksType::class, $tricks);
        
        //if a form has been send so we are not displaying the form but send the form and if the values are ok
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $tricks contains the form values
  
                //we save our entity in the db
                $em->persist($tricks);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Trick bien modifié et enregistrée.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_trickview', array('id' => $tricks->getId()));
        }

        return $this->render('S7tHDirectoryBundle:Tricks:edit.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }

    public function viewAction($id)
    {
        //recover the repository
        $repository = $this->getDoctrine()
            ->getManager()
            ->getRepository('S7tHDirectoryBundle:Tricks')
            ;
        
        //recover the entity with the same id
        //$tricks is a filled object of Tricks entity
        $trick = $repository->find($id);
        
        // if the id don't exist
        if (null === $trick)
        {
            throw new NotFoundHttpException("Le trick ayant l'id ".$id." n'existe pas.");
        }

        return $this->render('S7tHDirectoryBundle:Tricks:view.html.twig', array(
            'trick' => $trick,
        ));
    }

    public function deleteAction($id, Request $request)
    {
        //recover the entity manager
        $em = $this->getDoctrine()->getManager();

        //recover the repository
        $repository = $em->getRepository('S7tHDirectoryBundle:Tricks');
        
        //recover the entity with the same id
        $tricks = $repository->find($id);
        
        // if the id don't exist
        if (null === $tricks)
        {
            throw new NotFoundHttpException("Le trick ayant l'id ".$id." n'existe pas.");
        }

        //we delete our entity from the db
        $em->remove($tricks);//create the request sql for deleting
        $em->flush();//send the request and delete our object in the db

        $request->getSession()->getFlashBag()->add('notice', 'Trick bien supprimé.');

        // We are displaying now the homepage page thanks a redirection to its route.
        return $this->redirectToRoute('s7t_h_directory_tricklist');
        
    }
}
