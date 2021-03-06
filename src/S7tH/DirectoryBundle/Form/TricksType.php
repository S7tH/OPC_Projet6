<?php

namespace S7tH\DirectoryBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
/*for my form*/

use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;


/*end form import*/
use Symfony\Component\OptionsResolver\OptionsResolver;


class TricksType extends AbstractType
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class)
            ->add('description', TextareaType::class, array(
                   'required' => false
                    ))
            ->add('category', EntityType::class, array(
                              'class'        => 'S7tHDirectoryBundle:Category',
                              'choice_label' => 'name',
                              'multiple'     => false)
                 )
            ->add('image', ImageType::class, array('required' => true))
            ->add('save', SubmitType::class, array('label' => 'Enregistrer'));      
    }
    
    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'intention' => 'task_form',/*csrf key uniq per form*/
            'data_class' => 'S7tH\DirectoryBundle\Entity\Tricks'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix()
    {
        return 's7th_directorybundle_tricks';
    }


}
