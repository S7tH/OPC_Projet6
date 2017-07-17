<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Commentary;
/*end entities*/

/*for my form*/
use S7tH\DirectoryBundle\Form\CommentaryType;
/*end form*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/*call the request*/
use Symfony\Component\HttpFoundation\Request;

/*call the no http found exeption*/
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CommentariesController extends Controller
{
    public function addAction(Request $request)
    {
        //create my commentary object entity
        $commentary = new commentary();

        //create the formBuilder
        $form = $this->get('form.factory')->create(CommentaryType::class, $commentary);

        
        //if a form has been send so we are not displaying the form but send the form and if the values are ok
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $tricks contains the form values

                //we save our entity in the db
                $em = $this->getDoctrine()->getManager();
                $em->persist($commentary);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Commentaire bien enregistré.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_trickview', array(
                    'id' => $commentary->getId()));
        }

        //if any send, we are displaying the form
        return $this->render('S7tHDirectoryBundle:Commentaries:add.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }
}