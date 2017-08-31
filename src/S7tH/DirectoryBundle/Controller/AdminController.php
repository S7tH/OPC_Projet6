<?php

namespace S7tH\DirectoryBundle\Controller;

/*my entities*/
use S7tH\DirectoryBundle\Entity\Category;
/*end entities*/

/*for my form*/
use S7tH\DirectoryBundle\Form\CategoryaddType;
/*end form*/

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/*call the request*/
use Symfony\Component\HttpFoundation\Request;

/*call the no http found exeption*/
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/*for my autenthification acces control*/
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class AdminController extends Controller
{

    public function indexAction()
    {
        return $this->render('S7tHDirectoryBundle:Administration:index.html.twig');
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function addAction(Request $request)
    {
        /*administration of categories*/

        $category = new Category();
        $form = $this->get('form.factory')->create(CategoryaddType::class, $category);

        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            $em = $this->getDoctrine()
                    ->getManager();

            $em->persist($category);
            $em->flush();

            
            $request->getSession()->getFlashBag()->add('notice', 'Categorie bien enregistrée.');

            return $this->redirectToRoute('s7t_h_directory_adminlist');
        }

        return $this->render('S7tHDirectoryBundle:Administration:addCategories.html.twig', array(
            'form' => $form->createView(),
        ));

    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function listAction(Request $request)
    {
        /*administration of categories*/

        //recover the repository
        $repository = $this->getDoctrine()
            ->getManager()
            ->getRepository('S7tHDirectoryBundle:Category')
            ;
        
        //recover all the entities
        $categorylist = $repository->findAll();
    
       
        
        return $this->render('S7tHDirectoryBundle:Administration:listCategories.html.twig', array(
            'categorylist' => $categorylist,
        ));

    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function editAction(Category $category, Request $request )
    {
        /*administration of categories*/

        //recover entity manager
        $em = $this->getDoctrine()->getManager();
        

        //create the form
        $form = $this->get('form.factory')->create(CategoryaddType::class, $category);
        
        //if a form has been send so we are not displaying the form but send the form and if the values are ok
        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            // Now the variable $category contains the form values
  
                //we save our entity in the db
                $em->persist($category);//create the request sql
                $em->flush();//send the request and save in the db

                $request->getSession()->getFlashBag()->add('notice', 'Categorie bien modifiée et enregistrée.');

                // We are displaying now the trick introduce page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_adminlist');
        }

        return $this->render('S7tHDirectoryBundle:Administration:editCategories.html.twig',
        array(
                'form' => $form->createView(),
            ));
    }
    
    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function deleteAction(Category $category, Request $request)
    {
        /*administration of categories*/

        //recover the entity manager
        $em = $this->getDoctrine()->getManager();

        //we recover and check if the trick is linked to commentaries
        $repotricks = $em->getRepository('S7tHDirectoryBundle:Tricks');
        $tricks = $repotricks->findBy(array('category' => $category->getId()));

        foreach($tricks as $trick)
        {
            // if the category_id exist
            if(null !== $trick)
            {
                $request->getSession()->getFlashBag()->add('notice', 'Cette catégorie est liée à des tricks existant, pour la supprimer, il vous faudra d\'abord supprimer l\'ensemble des tricks de cette catégorie.');

                // We are displaying now the homepage page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_adminlist');
            }
        }

        //we delete our entity from the db
        $em->remove($category);//create the request sql for deleting
        $em->flush();//send the request and delete our object in the db

        $request->getSession()->getFlashBag()->add('notice', 'Catégorie bien supprimé.');

        // We are displaying now the homepage page thanks a redirection to its route.
        return $this->redirectToRoute('s7t_h_directory_adminlist');
        
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function memberAction()
    {
        //Pour récupérer le service UserManager du bundle
        $userManager = $this->get('fos_user.user_manager');
        $users = $userManager->findUsers();

        
        return $this->render('S7tHDirectoryBundle:Administration:memberlist.html.twig', array(
            'userlist' => $users
        ));
    }

    public function rolememberAction($nick, Request $request)
    {
        
        //recover the entity manager
        $userManager = $this->get('fos_user.user_manager');

        //recover the entity with the same id
        $user = $userManager->findUserBy(array('username' => $nick ));
        
        // if the id don't exist
        if (null === $nick)
        {
            throw new NotFoundHttpException("L'utilisateur' ".$nick." n'existe pas.");
        }
       
        if ($request->isMethod('POST'))
        {
                //we delete our entity from the db
                $role = $request->request->get('roles');
                //in case where he is an admin who get a simple user
                $user->removeRole('ROLE_ADMIN');
                $user->addRole($role);
                $userManager->updateUser($user);
                $request->getSession()->getFlashBag()->add('notice', 'Role utilisateur bien pris en compte.');

                // We are displaying now the adminpage page thanks a redirection to its route.
                return $this->redirectToRoute('s7t_h_directory_adminmember');
        }

        

        return $this->render('S7tHDirectoryBundle:Administration:rolemember.html.twig', array(
            'user' => $user
        ));
    }
}
