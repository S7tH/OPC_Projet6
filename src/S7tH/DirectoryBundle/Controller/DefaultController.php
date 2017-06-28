<?php

namespace S7tH\DirectoryBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('S7tHDirectoryBundle:Default:index.html.twig');
    }
}
