<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Tricks;
use S7tH\DirectoryBundle\Entity\Commentary;
/*end entities*/

/*for my form*/
use S7tH\DirectoryBundle\Form\TricksType;
use S7tH\DirectoryBundle\Form\TricksEditType;
use S7tH\DirectoryBundle\Form\CommentaryType;
/*end form*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/*call the request*/
use Symfony\Component\HttpFoundation\Request;

/*call the no http found exeption*/
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/*for my autenthification acces control*/
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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
        //$tricklist = $repository->findAll();
        $tricklist = $repository->tricklist();

        
        return $this->render('S7tHDirectoryBundle:Tricks:index.html.twig', array(
            'tricklist' => $tricklist,
        ));
    }
    
    /**
     * @Security("has_role('ROLE_USER')")
     */
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

                $request->getSession()->getFlashBag()->add('notice', 'Trick bien enregistré.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_tricklist');
        }

        //if any send, we are displaying the form
        return $this->render('S7tHDirectoryBundle:Tricks:add.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }
    
    /**
     * @Security("has_role('ROLE_USER')")
     */
    public function editAction(Tricks $tricks, Request $request )
    {
        //recover entity manager
        $em = $this->getDoctrine()->getManager();
        

        //create the form
        $form = $this->get('form.factory')->create(TricksEditType::class, $tricks);
        
        //if a form has been send so we are not displaying the form but send the form and if the values are ok
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $tricks contains the form values
  
                //we save our entity in the db
                $em->persist($tricks);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Trick bien modifié et enregistré.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_tricklist');
        }

        return $this->render('S7tHDirectoryBundle:Tricks:edit.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }

    public function viewAction(Tricks $trick, $page, Request $request)
    {
        //recover the entity manager
        $em = $this->getDoctrine()->getManager();

        
        /* method without paraconverter with $id in the parameter instead of Tricks $trick and $id instead of $trick->getId()
        
        //recover the entity with the same id after had recover the repository
        //$tricks is a filled object of Tricks entity
        $trick = $em->getRepository('S7tHDirectoryBundle:Tricks')->find($id);
        
        // if the id don't exist
        if (null === $trick)
        {
            throw new NotFoundHttpException("Le trick ayant l'id ".$id." n'existe pas.");
        }
        // with param converter this lines are useless
        */


        //we recover the user instance for our commentary
        $user = $this->getUser();
        $commentary = null;


        //if any user is connected user is null and we don't build a form and don't display it in twig view
        if ($user !== null)
        {
            //############## !!!! this part is for the commentaries
            //create my commentary object entity
            $commentary = new Commentary($trick);  
            $commentary->setUser($user);
        }
        
        //create the formBuilder
        $form = $this->get('form.factory')->create(CommentaryType::class, $commentary);

        //if a commentary form has been send we save the commentary after a check up on it.
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $tricks contains the form values

                //we save our entity in the db
                $em->persist($commentary);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('com', 'Votre message a bien été enregistré.');

                // we redirect the route with an ancre to see directly our last readed comment with " $this->redirect($this->generateUrl"
                return $this->redirect($this->generateUrl('s7t_h_directory_trickview', array('id' => $trick->getId(), 'page' => 1)) .'#coms');
        }
        
        
        //recover the commentaries for display them
        $commentaries = $em->getRepository('S7tHDirectoryBundle:Commentary')
          ->findByCom(
            $trick, 
            $page,
            10
          );

        //provisional var
        $nbcomPerPage = 10; 
        
        //paging system
        $paging = array(
            'page'=> $page,
            'nbPages' => ceil(count($commentaries) / $nbcomPerPage)
        );
          
        //##################end for the commentaries part

        return $this->render('S7tHDirectoryBundle:Tricks:view.html.twig', array(
            'trick' => $trick,
            'form' => $form->createView(),
            'commentaries' => $commentaries,
            'paging' => $paging,
            'id' => $trick->getId(),
        ));
    }

    public function deleteAction(Tricks $tricks,$state, Request $request)
    {
        
        if($state == 'confirm')
        {
            return $this->render('S7tHDirectoryBundle:Tricks:delete.html.twig',
             array(
                'tricks' => $tricks
            ));
        }
        else
        {
            //recover the entity manager
            $em = $this->getDoctrine()->getManager();

            //we recover and check if the trick is linked to commentaries
            $repoCom = $em->getRepository('S7tHDirectoryBundle:Commentary');
            $comments = $repoCom->findBy(array('trick' => $tricks->getId()));

            foreach($comments as $comment)
            {
                // if the trick_id exist
                if(null !== $comment)
                {
                    //we delete our entity from the db
                    $em->remove($comment);//create the request sql for deleting
                }
            }
 
            //we delete our entity from the db
            $em->remove($tricks);//create the request sql for deleting
            $em->flush();//send the request and delete our object in the db

            $request->getSession()->getFlashBag()->add('notice', 'Trick bien supprimé.');

            // We are displaying now the homepage page thanks a redirection to its route.
            return $this->redirectToRoute('s7t_h_directory_tricklist');
        }
    }
}
