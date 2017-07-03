<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Tricks;
/*end entities*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/*for my form*/
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
/*end form import*/

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
        $formBuilder = $this->get('form.factory')->createBuilder(FormType::class, $tricks);

        //add the fields
        $formBuilder
            ->add('name',     TextType::class)
            ->add('description',   TextareaType::class)
            ->add('date',      DateType::class)
            ->add('save',      SubmitType::class)
        ;

        //generate the formBuilder
        $form = $formBuilder->getForm();

        //if a form has been send so we are not displaying the form but send the form
        if ($request->isMethod('POST'))
        {
            // we make the link between request/form
            // Now the variable $tricks contains the form values
            $form->handleRequest($request);

            // we check if the values are ok
            if ($form->isValid())
            {
                //we save our entity in the db
                $em = $this->getDoctrine()->getManager();
                $em->persist($tricks);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Trick bien enregistrée.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_trickview', array('id' => $tricks->getId()));
            }
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
