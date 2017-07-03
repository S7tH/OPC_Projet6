<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Tricks;
/*end entities*/

/*for my form*/
use S7tH\DirectoryBundle\Form\TricksType;
/*end form*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class TricksController extends Controller
{
    public function indexAction()
    {
        return $this->render('S7tHDirectoryBundle:Tricks:index.html.twig');
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

    public function viewAction()
    {
        return $this->render('S7tHDirectoryBundle:Tricks:view.html.twig');
    }
}
