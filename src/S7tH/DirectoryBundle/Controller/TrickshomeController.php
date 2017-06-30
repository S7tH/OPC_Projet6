<?php

namespace S7tH\DirectoryBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class TrickshomeController extends Controller
{
    public function indexAction()
    {
        return $this->render('S7tHDirectoryBundle:Trickshome:index.html.twig');
    }
}
