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
    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function indexAction()
    {
        return $this->render('S7tHDirectoryBundle:Administration:index.html.twig');
    }

    /**
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function addAction(Request $request)
    {
        $category = new Category();
        $form = $this->get('form.factory')->create(CategoryaddType::class, $category);

        if ($request->isMethod('POST') && $form->handleRequest($request)->isValid())
        {
            $em = $this->getDoctrine()
                    ->getManager();

            $em->persist($category);
            $em->flush();

            
            $request->getSession()->getFlashBag()->add('notice', 'Categorie bien enregistrée.');

            return $this->redirectToRoute('s7t_h_directory_admin');
        }

        return $this->render('S7tHDirectoryBundle:Administration:addCategories.html.twig', array(
            'form' => $form->createView(),
        ));

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