<?php

namespace S7tH\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class SecurityController extends Controller
{
  public function loginAction(Request $request)
  {
    // if the visitor is already identified, come back to home
    if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED')) {
      return $this->redirectToRoute('s7t_h_directory_tricklist');
    }

    // the service authentication_utils allow to recover the user name
    // and the error in case where the form has already been send but was wrong
    $authenticationUtils = $this->get('security.authentication_utils');

    return $this->render('S7tHUserBundle:Security:login.html.twig', array(
      'last_username' => $authenticationUtils->getLastUsername(),
      'error'         => $authenticationUtils->getLastAuthenticationError(),
    ));
  }
}
