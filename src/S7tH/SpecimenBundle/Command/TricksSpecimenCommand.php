<?php

namespace S7tH\SpecimenBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class TricksSpecimenCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('tricks:specimen')
            ->setDescription('Load some samples of tricks');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output
            ->writeln('loading of tricks specimen...');
        
        //recover the tricks service and launch it
        $container = $this->getContainer();
        $service= $container->get('s7th.tricks.specimen');
        //recover the kernel root
        $rootParameter = $container->getParameter('specimen_path');

        $ret = $service->loadspecimenAction($rootParameter);
        $output->writeln('<info>'.$ret.'</info>');


        $output->writeln('Tricks specimen are completely loaded.');
    }

}
